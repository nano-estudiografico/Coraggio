// Hielos y una rodaja de naranja flotando sobre la ola naranja del pie.
// La superficie es la misma ola que pinta el CSS (.pie__agua): periodo de 50rem, 3.25rem de alto,
// empieza 1.625rem bajo el borde de .pie__olas y se desplaza a la izquierda un periodo cada 14 s.
// Cada hielo es un cuerpo con flotación (resorte amortiguado hacia la superficie), torque que lo
// inclina según la pendiente bajo él, arrastre del agua (corriente orbital + deriva) y choques entre hielos.

const OLA_PERIODO_REM = 50;
const OLA_ALTO_REM = 3.25;
const OLA_TOPE_REM = 1.125;
const OLA_DURACION = 14; // s, igual que @keyframes pie-ola
// asoma: cuánto del alto queda sobre el nivel del agua respecto al centro (+ asoma más, − se hunde más).
// El hielo flota alto; la rodaja de naranja es casi tan densa como el líquido y va más hundida.
const HIELOS = [
  [1, 222.92 / 183.21], [2, 224.27 / 182.4], [3, 204.93 / 183.5],
  [4, 212.31 / 194.26], [5, 219.02 / 193.11], [6, 155.16 / 189.05],
].map(([n, proporcion]) => ({ src: `img/hielos/hielo${n}.svg`, proporcion, asoma: 0.08 }));
const NARANJA = { src: 'img/hielos/naranja.svg', proporcion: 400.5 / 338.19, asoma: -0.06, escala: 1.944 };

const VAPOR = [ // posición horizontal (% del ancho) y retraso de cada voluta
  [9, 0], [22, 1.6], [37, 0.7], [53, 2.4], [68, 1.1], [83, 2.9], [94, 0.4],
];

const olas = document.querySelector('.pie__olas');
const capa = olas?.querySelector('.pie__hielos');
const agua = olas?.querySelector('.pie__agua');
if (olas && capa && agua) iniciar();

function iniciar() {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let medidas, hielos = [], anterior = 0, cuadro = 0, visible = false;

  // Altura de la superficie (px desde el borde de .pie__olas) y su pendiente en x, en el instante t (s).
  // La ola del SVG: tramos de 200 unidades (de 800) con curvas cuadráticas y = 20 ∓ 40·p·(1−p).
  function superficie(x, t) {
    const { periodo, alto, tope } = medidas;
    const corrimiento = periodo * ((t / OLA_DURACION) % 1);
    const u = ((((x + corrimiento) % periodo) + periodo) % periodo) * (800 / periodo);
    const tramo = Math.floor(u / 200);
    const p = (u % 200) / 200;
    const signo = tramo % 2 === 0 ? -1 : 1; // tramos pares suben (cresta), impares bajan (valle)
    const y = 20 + signo * 40 * p * (1 - p);
    const dy = (signo * 40 * (1 - 2 * p)) / 200; // unidades/unidad
    return { y: tope + (y / 40) * alto, pendiente: dy * (alto / 40) / (periodo / 800), elevacion: (20 - y) / 20 };
  }

  function medir() {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    medidas = {
      ancho: olas.clientWidth,
      periodo: OLA_PERIODO_REM * rem,
      alto: OLA_ALTO_REM * rem,
      tope: OLA_TOPE_REM * rem,
    };
  }

  function crear() {
    capa.replaceChildren();
    const { ancho } = medidas;
    const cantidad = Math.max(3, Math.min(7, Math.round(ancho / 230)));
    const escala = ancho < 640 ? 0.8 : 1;
    const t = tiempo();
    const conNaranja = cantidad - 2; // una rodaja, segunda desde la derecha
    hielos = Array.from({ length: cantidad }, (_, i) => {
      const tipo = i === conNaranja ? NARANJA : HIELOS[(i > conNaranja ? i - 1 : i) % HIELOS.length];
      const lado = (48 + ((i * 37) % 5) * 5) * escala * (tipo.escala ?? 1); // 48–68 px, variados
      const alto = lado * tipo.proporcion;
      const img = new Image();
      img.src = tipo.src;
      img.alt = '';
      img.decoding = 'async';
      img.width = lado;
      capa.append(img);
      const x = ((i + 0.5) / cantidad) * ancho + (((i * 53) % 7) - 3) * 9;
      const h = flotacion(x, lado, alto, tipo.asoma, t);
      return { img, lado, alto, asoma: tipo.asoma, masa: lado * alto, x, vx: 0, y: h.y, vy: 0, giro: h.angulo, vgiro: 0, deriva: 5 + ((i * 29) % 4) };
    });
    pintar();
  }

  // Lo que el agua le pide a un hielo: promedia la superficie en tres puntos de su base
  // (un hielo ancho no sigue ondas cortas) y se inclina con la pendiente entre sus bordes.
  function flotacion(x, lado, alto, asoma, t) {
    const izq = superficie(x - lado * 0.45, t);
    const cen = superficie(x, t);
    const der = superficie(x + lado * 0.45, t);
    const nivel = (izq.y + 2 * cen.y + der.y) / 4;
    return {
      y: nivel - alto * asoma,
      angulo: Math.atan2(der.y - izq.y, lado * 0.9) * 0.85,
      elevacion: cen.elevacion,
    };
  }

  function tiempo() {
    const anim = agua.getAnimations?.({ subtree: true }).find((a) => a.animationName === 'pie-ola');
    return anim && anim.currentTime != null ? (anim.currentTime / 1000) % OLA_DURACION : 0;
  }

  function paso(dt, t) {
    const { ancho, alto } = medidas;
    for (const h of hielos) {
      const f = flotacion(h.x, h.lado, h.alto, h.asoma, t);
      const inercia = 60 / Math.sqrt(h.lado * h.alto); // los grandes responden más lento
      // Flotación: resorte amortiguado (subamortiguado, ζ≈0.35) hacia el nivel del agua.
      const k = 14 * inercia;
      h.vy += (k * (f.y - h.y) - 2 * 0.35 * Math.sqrt(k) * h.vy) * dt;
      // Torque hacia la pendiente: se mece y se pasa un poco antes de asentarse.
      const kg = 11 * inercia;
      h.vgiro += (kg * (f.angulo - h.giro) - 2 * 0.28 * Math.sqrt(kg) * h.vgiro) * dt;
      // Arrastre horizontal: en la cresta el agua va con la ola (izquierda), en el valle vuelve; más una deriva lenta.
      const corriente = -h.deriva - f.elevacion * alto * 0.35;
      h.vx += (corriente - h.vx) * 1.2 * dt;
    }
    chocar();
    for (const h of hielos) {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.giro += h.vgiro * dt;
      // Sale por la izquierda y vuelve a entrar por la derecha.
      if (h.x < -h.lado) h.x += ancho + h.lado * 2;
      else if (h.x > ancho + h.lado) h.x -= ancho + h.lado * 2;
    }
  }

  // Choques entre vecinos: separa los que se pisan y reparte el impulso según la masa (poco elásticos).
  function chocar() {
    const orden = [...hielos].sort((a, b) => a.x - b.x);
    for (let i = 0; i < orden.length - 1; i++) {
      const a = orden[i], b = orden[i + 1];
      const minimo = (a.lado + b.lado) * 0.42;
      const solape = minimo - (b.x - a.x);
      if (solape <= 0) continue;
      const total = a.masa + b.masa;
      a.x -= solape * (b.masa / total);
      b.x += solape * (a.masa / total);
      const relativa = b.vx - a.vx;
      if (relativa < 0) {
        const j = (-(1 + 0.3) * relativa) / (1 / a.masa + 1 / b.masa);
        a.vx -= j / a.masa;
        b.vx += j / b.masa;
        a.vgiro -= relativa * 0.004; // el golpe los hace cabecear
        b.vgiro += relativa * 0.004;
      }
    }
  }

  function pintar() {
    for (const h of hielos) {
      h.img.style.transform = `translate(${h.x - h.lado / 2}px, ${h.y - h.alto / 2}px) rotate(${h.giro}rad)`;
    }
  }

  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - anterior) / 1000 || 0);
    anterior = ahora;
    // Subpasos para que los resortes sean estables aunque el cuadro llegue tarde.
    const t = tiempo();
    const n = Math.ceil(dt / 0.01);
    for (let i = 0; i < n; i++) paso(dt / n, t - dt + ((i + 1) * dt) / n);
    pintar();
    cuadro = requestAnimationFrame(bucle);
  }

  function arrancar() {
    if (quieto || cuadro || !visible) return;
    anterior = performance.now();
    cuadro = requestAnimationFrame(bucle);
  }

  function parar() {
    cancelAnimationFrame(cuadro);
    cuadro = 0;
  }

  medir();
  crear();
  alternarEscenas(quieto);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? arrancar() : parar();
  }).observe(olas);

  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));

  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const antes = medidas.ancho;
      medir();
      if (Math.round(antes / 230) !== Math.round(medidas.ancho / 230)) crear();
      else pintar();
    }, 150);
  });
}

// Escenas del pie: aperitivo (hielos) y café (vapor) se alternan cada 10 s.
// Con "reducir movimiento" se queda en la escena de aperitivo.

function alternarEscenas(quieto) {
  const pie = olas.closest('.pie');
  if (!pie || quieto) return;
  const vapor = document.createElement('div');
  vapor.className = 'pie__vapor';
  vapor.setAttribute('aria-hidden', 'true');
  // Degradado y recortes compartidos (userSpaceOnUse: se aplican en las coordenadas de cada voluta, 0–140 de abajo a arriba).
  const defs = `<svg class="pie__vapor-color" width="0" height="0"><defs>
    <linearGradient id="pie-vapor-color" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="0">
      <stop offset="0" stop-color="currentColor" stop-opacity="0.35"/><stop offset="0.2" stop-color="currentColor" stop-opacity="0.35"/>
      <stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient>
    <clipPath id="pie-vapor-abajo" clipPathUnits="userSpaceOnUse"><rect x="-20" y="77" width="80" height="80"/></clipPath>
    <clipPath id="pie-vapor-arriba" clipPathUnits="userSpaceOnUse"><rect x="-20" y="-20" width="80" height="97"/></clipPath>
  </defs></svg>`;
  const linea = 'M20 140C6 118 34 100 20 78S6 36 20 14';
  vapor.innerHTML = defs + VAPOR.map(([x, d]) =>
    `<svg viewBox="0 0 40 140" style="left:${x}%;--retraso:${d}s"><path class="pie__vapor-base" clip-path="url(#pie-vapor-abajo)" d="${linea}"/><path clip-path="url(#pie-vapor-arriba)" d="${linea}"/></svg>`).join('');
  olas.insertBefore(vapor, olas.querySelector('.contenedor'));
  setInterval(() => pie.classList.toggle('pie--cafe'), 10000);
}
