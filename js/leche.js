// Chorro de leche en la escena café del pie (fondo crema): cae por detrás de las franjas de ola
// y entra en la ola de fondo, como la leche que se le echa al café.
// Física: cada "parcela" de leche sale arriba con una velocidad inicial y cae con gravedad constante.
// Por continuidad (caudal = área · velocidad) el chorro se angosta al acelerar: ancho ∝ √(v0 / v).
// Al caer aparecen ondulaciones de Rayleigh-Plateau que viajan con el líquido. Donde toca la ola de fondo
// levanta un montículo, salpica gotas balísticas y abre ondas que se alejan y se amortiguan.

const G = 2200; // px/s²
const V0 = 220; // px/s al asomar arriba
const ANCHO = 26; // px al asomar arriba
const EMISION = 1 / 90; // s entre parcelas
const INICIO = 0.7; // s después de entrar en la escena café
const FIN = 8.2; // s: corta el caudal (la escena dura 10 s)
const RAMPA_ON = 0.35, RAMPA_OFF = 0.6;
// Ola de fondo (.pie__olas::before): periodo 36rem, 2.5rem de alto, desde 0.75rem, se corre a la derecha cada 14.4 s.
const FONDO = { periodo: 36, alto: 2.5, tope: 0.75, duracion: 14.4 };

const olas = document.querySelector('.pie__olas');
const pie = olas?.closest('.pie');
if (olas && pie && !matchMedia('(prefers-reduced-motion: reduce)').matches) iniciar();

function iniciar() {
  const lienzo = document.createElement('canvas');
  lienzo.className = 'pie__leche';
  lienzo.setAttribute('aria-hidden', 'true');
  olas.prepend(lienzo);
  const ctx = lienzo.getContext('2d');

  let m; // medidas
  let parcelas = [], gotas = [], ondas = [];
  let escena = null, ultimaEmision = 0, ultimaOnda = 0, monticulo = 0, impacto = null;
  let cuadro = 0, anterior = 0, visible = false;

  function medir() {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const estilo = getComputedStyle(pie);
    const dpr = Math.min(2, devicePixelRatio || 1);
    const ancho = olas.clientWidth;
    // En escritorio el chorro baja desde arriba del pie por el hueco vacío entre el logo y Visítanos;
    // si no hay hueco (celular) baja por la derecha, desde debajo de la última línea de texto que le cruzaría el camino.
    const cols = pie.querySelector('.pie__columnas');
    const [c1, c2] = cols ? cols.children : [];
    const caja = olas.getBoundingClientRect();
    let x = ancho - Math.max(2.5 * rem, ancho * 0.12), arriba = olas.offsetTop;
    const a = c1?.getBoundingClientRect(), b = c2?.getBoundingClientRect();
    if (a && b && Math.abs(a.top - b.top) < 4 && b.left - a.right > 6 * rem) {
      x = (a.right + b.left) / 2 - caja.left;
    } else if (cols) {
      const izq = caja.left + x - ANCHO;
      let bajo = -Infinity;
      const recorrido = document.createTreeWalker(cols, NodeFilter.SHOW_TEXT);
      const rango = document.createRange();
      for (let n; (n = recorrido.nextNode());) {
        if (!n.textContent.trim()) continue;
        rango.selectNodeContents(n);
        for (const r of rango.getClientRects()) if (r.right > izq) bajo = Math.max(bajo, r.bottom);
      }
      if (bajo > -Infinity) arriba = Math.min(arriba, Math.max(0, caja.top - bajo - 0.75 * rem));
    }
    const alto = arriba + olas.clientHeight;
    m = {
      rem, dpr, ancho, alto, arriba, x,
      color: estilo.getPropertyValue('--crema-oscura').trim() || '#EAE1D0',
      oliva: estilo.getPropertyValue('--oliva').trim() || '#303717',
      periodo: FONDO.periodo * rem, olaAlto: FONDO.alto * rem, olaTope: arriba + FONDO.tope * rem,
    };
    lienzo.style.top = `${-arriba}px`;
    lienzo.style.height = `${alto}px`;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
  }

  // Superficie de la ola de fondo en x (coordenadas del lienzo), con la misma curva que el SVG de --ola.
  function superficie(x) {
    const anim = olas.getAnimations?.({ subtree: true }).find((a) => a.animationName === 'pie-ola-fondo');
    const t = anim && anim.currentTime != null ? (anim.currentTime / 1000) % FONDO.duracion : 0;
    const { periodo, olaAlto, olaTope } = m;
    const u = ((((x - periodo * (t / FONDO.duracion)) % periodo) + periodo) % periodo) * (800 / periodo);
    const p = (u % 200) / 200;
    const signo = Math.floor(u / 200) % 2 === 0 ? -1 : 1;
    return olaTope + ((20 + signo * 40 * p * (1 - p)) / 40) * olaAlto;
  }

  // Caudal relativo (0–1) según el tiempo dentro de la escena.
  function caudal(s) {
    if (s < INICIO || s > FIN) return 0;
    const on = Math.min(1, (s - INICIO) / RAMPA_ON);
    const off = Math.min(1, (FIN - s) / RAMPA_OFF);
    const suave = (k) => k * k * (3 - 2 * k);
    return suave(on) * suave(off);
  }

  function emitir(ahora) {
    const s = (ahora - escena) / 1000;
    while (ultimaEmision <= s) {
      const q = caudal(ultimaEmision);
      if (q > 0.02) {
        const te = ultimaEmision;
        // La jarra se mece apenas: el punto de salida oscila y la parcela conserva su velocidad lateral.
        parcelas.push({ te, x0: m.x + 3 * Math.sin(te * 1.7) + 1.5 * Math.sin(te * 4.3), vx: 5.1 * Math.cos(te * 1.7), w: ANCHO * Math.sqrt(q) });
      } else if (parcelas.length && !parcelas.at(-1).gota && ultimaEmision > FIN && ultimaEmision < FIN + 0.5) {
        // Una última gota se desprende un momento después de cortar el chorro.
        parcelas.push({ te: FIN + 0.35, x0: m.x, vx: 0, w: ANCHO * 0.45, gota: true, sola: true });
        ultimaEmision = FIN + 0.5;
      }
      ultimaEmision += EMISION;
    }
  }

  function posicion(p, s) {
    const a = Math.max(0, s - p.te);
    const v = V0 + G * a;
    const y = V0 * a + 0.5 * G * a * a;
    // Rayleigh-Plateau: la ondulación del ancho crece con la caída y viaja con el líquido.
    const onda = 1 + Math.min(0.18, a * 0.3) * Math.sin(p.te * 55);
    return { x: p.x0 + p.vx * a, y, w: p.w * Math.sqrt(V0 / v) * onda, v };
  }

  function salpicar(x, w, v, dt) {
    monticulo += (w * 1.3 - monticulo) * Math.min(1, dt * 10);
    impacto = x;
    const tasa = w * 3; // gotas por segundo, según el grosor
    if (Math.random() < tasa * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1;
      gotas.push({ x: x + lado * w * 0.4, y: superficie(x) - 2, vx: lado * (30 + Math.random() * 110), vy: -(v * (0.12 + Math.random() * 0.14)), r: 1.2 + Math.random() * w * 0.12 });
    }
  }

  function paso(dt, ahora) {
    const s = (ahora - escena) / 1000;
    emitir(ahora);
    let golpe = null;
    parcelas = parcelas.filter((p) => {
      const q = posicion(p, s);
      const fondo = superficie(q.x);
      if (q.y >= fondo) {
        if (!p.entro) {
          p.entro = true;
          if (p.sola) ondas.push({ x: q.x, t: s, amp: 4 });
        }
        if (!p.sola && (!golpe || q.y < golpe.y)) golpe = q; // la parcela que está entrando ahora
      }
      return q.y < fondo + 30;
    });
    const golpea = !!golpe;
    if (golpe) salpicar(golpe.x, golpe.w, golpe.v, dt);
    if (golpea && s - ultimaOnda > 0.32) {
      ondas.push({ x: impacto, t: s, amp: 3.5 + monticulo * 0.18 });
      ultimaOnda = s;
    }
    if (!golpea) monticulo *= Math.exp(-dt * 6);
    for (const g of gotas) {
      g.vy += G * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
    }
    gotas = gotas.filter((g) => {
      if (g.vy > 0 && g.y > superficie(g.x)) {
        if (g.r > 2) ondas.push({ x: g.x, t: s, amp: g.r * 0.5 });
        return false;
      }
      return true;
    });
    ondas = ondas.filter((o) => s - o.t < 3.5);
    return s;
  }

  // Altura de las ondas y el montículo sobre la superficie en x.
  function bulto(x, s) {
    let h = impacto == null ? 0 : monticulo * Math.exp(-(((x - impacto) / (monticulo * 1.4 + 1)) ** 2));
    for (const o of ondas) {
      const edad = s - o.t;
      const radio = 14 + 55 * edad;
      const sigma = 7 + 12 * edad;
      const d = Math.abs(x - o.x) - radio;
      h += o.amp * Math.exp(-edad / 1.1) * Math.exp(-((d / sigma) ** 2)) * Math.cos(d / sigma * 1.6);
    }
    return Math.max(0, h);
  }

  function dibujar(s) {
    const { dpr, ancho, alto, color, oliva } = m;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Chorro: tramos continuos de parcelas consecutivas, cortados en la superficie.
    const pts = [];
    for (const p of parcelas) {
      if (p.te > s || p.gota) continue;
      const q = posicion(p, s);
      const fondo = superficie(q.x);
      pts.push(q.y > fondo + 4 ? null : q);
    }
    const tramos = [];
    let actual = [];
    for (const q of pts) {
      if (q) actual.push(q);
      else if (actual.length) { tramos.push(actual); actual = []; }
    }
    if (actual.length) tramos.push(actual);

    // Recorre un borde del tramo: lado −1 el izquierdo, +1 el derecho.
    const borde = (t, lado) => t.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q.x + (lado * q.w) / 2, q.y));
    for (const t of tramos) {
      if (t.length < 2) continue;
      ctx.beginPath();
      borde(t, -1);
      for (let i = t.length - 1; i >= 0; i--) ctx.lineTo(t[i].x + t[i].w / 2, t[i].y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      // Puntas redondeadas: arriba, y abajo la cabeza del chorro mientras cae.
      for (const q of [t[0], t.at(-1)]) {
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Volumen: sombra suave en el borde derecho y más tenue en el izquierdo.
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = oliva;
      ctx.lineWidth = 1;
      ctx.beginPath();
      borde(t, 1);
      ctx.stroke();
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      borde(t, -1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Gotas: la última del chorro y las salpicaduras.
    const sueltas = parcelas.filter((p) => p.gota && p.te <= s).map((p) => {
      const q = posicion(p, s);
      return { x: q.x, y: q.y, r: q.w * 0.55, estira: Math.min(1.6, 1 + q.v / 2400) };
    }).concat(gotas.map((g) => ({ x: g.x, y: g.y, r: g.r, estira: 1 + Math.min(0.5, Math.hypot(g.vx, g.vy) / 900) })));
    for (const g of sueltas) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.r / Math.sqrt(g.estira), g.r * g.estira, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = oliva;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Montículo y ondas sobre la ola de fondo.
    if (impacto != null && (monticulo > 0.3 || ondas.length)) {
      const izq = Math.max(0, impacto - 260), der = Math.min(ancho, impacto + 260);
      const borde = [];
      for (let x = izq; x <= der; x += 3) borde.push([x, superficie(x), bulto(x, s)]);
      if (borde.some(([, , h]) => h > 0.2)) {
        ctx.beginPath();
        borde.forEach(([x, y, h], i) => (i ? ctx.lineTo(x, y - h) : ctx.moveTo(x, y - h)));
        for (let i = borde.length - 1; i >= 0; i--) ctx.lineTo(borde[i][0], borde[i][1] + 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = oliva;
        ctx.lineWidth = 1;
        ctx.beginPath();
        borde.forEach(([x, y, h], i) => (i ? ctx.lineTo(x, y - h - 0.6) : ctx.moveTo(x, y - h - 0.6)));
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        let trazando = false;
        for (const [x, y, h] of borde) {
          if (h > 0.4) trazando ? ctx.lineTo(x, y - h) : (ctx.moveTo(x, y - h), (trazando = true));
          else trazando = false;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - anterior) / 1000 || 0);
    anterior = ahora;
    const n = Math.max(1, Math.ceil(dt / 0.008));
    let s = 0;
    for (let i = 0; i < n; i++) s = paso(dt / n, ahora - dt * 1000 + ((i + 1) * dt * 1000) / n);
    dibujar(s);
    const vivo = escena != null || parcelas.length || gotas.length || ondas.length;
    cuadro = vivo ? requestAnimationFrame(bucle) : 0;
  }

  function arrancar() {
    if (cuadro || !visible || document.hidden || escena == null) return;
    anterior = performance.now();
    cuadro = requestAnimationFrame(bucle);
  }

  function parar() {
    cancelAnimationFrame(cuadro);
    cuadro = 0;
  }

  function cambioDeEscena() {
    if (pie.classList.contains('pie--cafe')) {
      medir();
      escena = performance.now();
      ultimaEmision = 0;
      ultimaOnda = 0;
      parcelas = []; gotas = []; ondas = []; monticulo = 0; impacto = null;
      arrancar();
    } else {
      escena = null; // lo que ya está en el aire termina de caer mientras el lienzo se desvanece
    }
  }

  medir();
  new MutationObserver(cambioDeEscena).observe(pie, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? arrancar() : parar();
  }).observe(olas);
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(medir, 150);
  });
}
