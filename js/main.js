import { estadoHorario } from './horario.js';

// Abierto / Cerrado según la hora de Medellín; sin JS queda solo el horario escrito.
const estado = document.getElementById('estado-horario');
if (estado) {
  const { abierto, etiqueta, detalle } = estadoHorario(new Date());
  estado.textContent = `${etiqueta} · ${detalle}`;
  estado.classList.add(abierto ? 'estado--abierto' : 'estado--cerrado');
  estado.hidden = false;
}

// Flechas del carrusel de reseñas (la lista también se desplaza con el dedo o el teclado).
const lista = document.getElementById('resenas-lista');
const flechas = document.querySelector('.resenas__flechas');
if (lista && flechas) {
  flechas.hidden = false;
  flechas.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-dir]');
    if (!boton) return;
    const paso = lista.querySelector('.resena').offsetWidth + 24;
    lista.scrollBy({ left: paso * Number(boton.dataset.dir), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

// Tarjetas de copas: en pantallas táctiles cada toque gira la tarjeta y el siguiente la devuelve
// (con cursor giran al pasar por encima, sin JS).
if (matchMedia('(hover: none)').matches) {
  document.querySelector('.copas__grilla')?.addEventListener('click', (e) => {
    e.target.closest('.copa')?.classList.toggle('copa--girada');
  });
}

// Frase de marca: la barra con oleaje sube desde abajo cuando la frase se ve.
const titular = document.querySelector('.frase__titular');
if (titular && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  titular.classList.add('frase__titular--vacia');
  const verTitular = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    verTitular.disconnect();
    requestAnimationFrame(() => titular.classList.remove('frase__titular--vacia'));
  }, { threshold: 0.6 });
  verTitular.observe(titular);
}

// Momentos: el título se lee sobre la foto, se desvanece y entran los stickers (el CSS lleva los tiempos).
const escenaMomentos = document.querySelector('.momentos__escena');
if (escenaMomentos && 'IntersectionObserver' in window) {
  escenaMomentos.classList.add('momentos--espera');
  const verMomentos = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    verMomentos.disconnect();
    requestAnimationFrame(() => escenaMomentos.classList.remove('momentos--espera'));
  }, { threshold: 0.8 }); // arranca cuando se ve el 80 % de la foto
  verMomentos.observe(escenaMomentos.querySelector('.momentos__foto'));
}

// Stickers de Momentos: se arrastran con el mouse o el dedo; el último que se toca queda encima.
let capaSticker = 1;
document.querySelectorAll('.sticker').forEach((sticker) => {
  let inicio = null;
  sticker.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // sin selección de texto ni arrastre nativo, que cancelarían el puntero
    const [x = 0, y = 0] = (sticker.style.translate || '0px 0px').split(' ').map(parseFloat);
    inicio = { px: e.clientX, py: e.clientY, x, y };
    sticker.setPointerCapture(e.pointerId);
    sticker.style.zIndex = ++capaSticker;
    sticker.classList.add('sticker--arrastrando');
  });
  const mover = (e) => {
    if (!inicio) return;
    sticker.style.translate = `${inicio.x + e.clientX - inicio.px}px ${inicio.y + e.clientY - inicio.py}px`;
  };
  sticker.addEventListener('pointermove', mover);
  const soltar = () => { inicio = null; sticker.classList.remove('sticker--arrastrando'); };
  sticker.addEventListener('pointerup', (e) => { mover(e); soltar(); });
  sticker.addEventListener('pointercancel', soltar);
  sticker.addEventListener('dragstart', (e) => e.preventDefault());
});

// Titular de «De día café…»: las letras parten apretadas entre sí, con un apriete distinto al azar
// en cada una, y se separan suavemente hasta su lugar. Cada letra se desplaza hacia el centro de su palabra.
const tituloDia = document.getElementById('dia-titulo');
if (tituloDia && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const texto = tituloDia.textContent;
  tituloDia.setAttribute('aria-label', texto);
  tituloDia.textContent = '';
  const palabras = texto.split(' ').map((palabra, i, todas) => {
    const p = document.createElement('span');
    p.className = 'dia__palabra';
    p.setAttribute('aria-hidden', 'true');
    p.innerHTML = [...palabra].map((c) => `<span class="dia__letra">${c}</span>`).join('');
    tituloDia.append(p, i < todas.length - 1 ? ' ' : '');
    return p;
  });
  // Se mide con la fuente ya cargada y antes de que el titular se vea: así las letras ya están apretadas al aparecer.
  document.fonts.ready.then(() => {
    palabras.forEach((p) => {
      const centro = p.offsetWidth / 2;
      p.querySelectorAll('.dia__letra').forEach((l) => {
        const apriete = 0.45 + Math.random() * 0.5; // 45–95 % del camino hacia el centro
        l.style.setProperty('--dx', `${(centro - (l.offsetLeft + l.offsetWidth / 2)) * apriete}px`);
        l.style.setProperty('--dur', `${Math.round(Math.random() * 350)}ms`);
      });
    });
    tituloDia.classList.add('dia__titulo--junto');
    const verDia = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      verDia.disconnect();
      requestAnimationFrame(() => tituloDia.classList.remove('dia__titulo--junto'));
    }, { threshold: 0.8 });
    verDia.observe(tituloDia);
  });
}

// Momento firma: dos capas de olas cubren la sección y se retiran hacia arriba al verla (efecto
// "SVG Shape Overlays" de GreenSock, sin GSAP: los 10 puntos de cada ola bajan de 100 a 0 con un
// retraso al azar y power2.inOut). Sin "reducir movimiento" no se dibuja nada y el texto queda a la vista.
const firma = document.getElementById('firma');
const velo = firma?.querySelector('.firma__velo');
if (velo && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const capas = [...velo.querySelectorAll('.firma__velo-capa')];
  const puntos = 10;
  const retrasoMax = 0.3; // s, retraso aleatorio por punto
  const retrasoCapa = 0.25; // s, entre capas
  const duracion = 0.9; // s por punto
  const valores = capas.map(() => Array(puntos).fill(100));
  const retrasosPunto = Array.from({ length: puntos }, () => Math.random() * retrasoMax);
  const dibujar = () => {
    capas.forEach((capa, i) => {
      const y = valores[i];
      let d = `M 0 ${y[0]} C`;
      for (let j = 0; j < puntos - 1; j++) {
        const p = ((j + 1) / (puntos - 1)) * 100;
        const cp = p - ((1 / (puntos - 1)) * 100) / 2;
        d += ` ${cp} ${y[j]} ${cp} ${y[j + 1]} ${p} ${y[j + 1]}`;
      }
      capa.setAttribute('d', `${d} V 0 H 0`);
    });
  };
  const suavizar = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2); // power2.inOut
  dibujar();
  const verFirma = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    verFirma.disconnect();
    const inicio = performance.now();
    const total = (retrasoMax + retrasoCapa * (capas.length - 1) + duracion) * 1000;
    const paso = (ahora) => {
      const t = ahora - inicio;
      capas.forEach((_, i) => {
        const retrasoDeCapa = retrasoCapa * (capas.length - i - 1) * 1000;
        for (let j = 0; j < puntos; j++) {
          const local = Math.min(Math.max((t - (retrasosPunto[j] * 1000 + retrasoDeCapa)) / (duracion * 1000), 0), 1);
          valores[i][j] = 100 * (1 - suavizar(local));
        }
      });
      dibujar();
      if (t < total) requestAnimationFrame(paso);
      else velo.remove();
    };
    requestAnimationFrame(paso);
  }, { threshold: Math.min(0.7, (innerHeight * 0.7) / firma.offsetHeight) }); // 70 % visible; si la sección es más alta que la pantalla, con 70 % de la pantalla cubierta por ella
  verFirma.observe(firma);
}

// Oferta: siempre queda una abierta; tocar la que ya está abierta no la cierra.
document.querySelectorAll('.dia__oferta summary').forEach((s) => {
  s.addEventListener('click', (e) => { if (s.parentElement.open) e.preventDefault(); });
});

// Entrada de las copas: al acercarse a la pantalla las tarjetas esperan fuera, por el borde izquierdo;
// al verse entran juntas como un mazo hasta el lugar de la primera (Aperol). Por inercia, mientras viajan
// se inclinan hacia atrás (izquierda) y al frenar se balancean hacia adelante (derecha); ese impulso lanza
// a las demás hasta su sitio, donde se enderezan. La primera se asienta en el suyo. Solo con varias
// columnas y sin "reducir movimiento".
const grillaCopas = document.querySelector('.copas__grilla');
if (grillaCopas && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const copas = [...grillaCopas.children];
  const columnas = () => getComputedStyle(grillaCopas).gridTemplateColumns.split(' ').length;
  const llegada = 550; // ms del viaje del mazo hasta el lugar de la primera
  const frenado = 0.7; // fracción del viaje en que empieza a frenar: hasta ahí van inclinadas hacia atrás
  const viaje = 'cubic-bezier(0.45, 0, 0.55, 0.85)'; // acelera y frena sin detenerse (pendiente final 1/3)
  const lanzada = 'cubic-bezier(0.2, 0.24, 0.35, 1)'; // sale con impulso (pendiente 1,2) y frena en su sitio
  const asienta = 180; // ms que la primera se pasa de su lugar antes de volver
  // Inclinación desde la base: las de atrás, más (atrás = hacia la izquierda, adelante = hacia la derecha).
  const atras = (i) => `${-4 - i * 3}deg`;
  const adelante = (i) => `${3 + i * 3}deg`;
  let recorridos = null; // por tarjeta, relativo a su lugar: desde dónde entra y dónde queda la primera
  const sacar = () => {
    const primera = copas[0].getBoundingClientRect();
    recorridos = copas.map((copa, i) => {
      const r = copa.getBoundingClientRect();
      const inicio = [-r.right - 40, primera.top - r.top];
      const enPrimera = [primera.left - r.left, primera.top - r.top];
      copa.style.translate = `${inicio[0]}px ${inicio[1]}px`;
      copa.style.rotate = atras(i);
      copa.style.transformOrigin = '50% 100%';
      copa.style.zIndex = copas.length - i; // la primera encima de todas; la última (Mimosa) debajo
      return { inicio, enPrimera };
    });
  };
  const px = ([x, y]) => `${x}px ${y}px`;
  const repartir = () => {
    const animaciones = copas.map((copa, i) => {
      const { inicio, enPrimera } = recorridos[i];
      const tramo1 = Math.hypot(enPrimera[0] - inicio[0], enPrimera[1] - inicio[1]);
      const tramo2 = Math.hypot(...enPrimera);
      copa.style.translate = copa.style.rotate = '';
      const primera = tramo2 < 1;
      const duracion = primera ? llegada + asienta * 2 : llegada * (1 + tramo2 / tramo1);
      const en = (ms) => ms / duracion;
      // Desplazamiento.
      const mover = primera
        ? [ // la primera frena, se pasa un poco por la inercia y vuelve
          { translate: px(inicio), easing: viaje },
          { translate: '0px 0px', offset: en(llegada), easing: 'cubic-bezier(0.1, 0.3, 0.3, 1)' },
          { translate: `${(tramo1 / llegada / 3) * asienta / 3}px 0px`, offset: en(llegada + asienta), easing: 'ease-in-out' },
          { translate: '0px 0px' },
        ]
        : [
          { translate: px(inicio), easing: viaje },
          { translate: px(enPrimera), offset: en(llegada), easing: lanzada },
          { translate: '0px 0px' },
        ];
      // Inclinación: hacia atrás mientras viajan, hacia adelante al frenar, derechas al llegar a su sitio.
      const inclinar = [
        { rotate: atras(i) },
        { rotate: atras(i), offset: en(llegada * frenado), easing: 'ease-in-out' },
        { rotate: adelante(i), offset: en(llegada), easing: primera ? 'ease-in-out' : lanzada },
        ...(primera ? [{ rotate: '0deg', offset: en(llegada + asienta) }] : []),
        { rotate: '0deg' },
      ];
      return [copa.animate(mover, { duration: duracion }), copa.animate(inclinar, { duration: duracion })];
    }).flat();
    Promise.all(animaciones.map((a) => a.finished)).then(() => copas.forEach((copa) => {
      copa.style.zIndex = copa.style.transformOrigin = '';
    }));
  };
  const cerca = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    cerca.disconnect();
    if (columnas() > 1) sacar();
  }, { rootMargin: '0px 0px 300px 0px' });
  const visible = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || !recorridos) return;
    visible.disconnect();
    requestAnimationFrame(repartir);
  }, { threshold: 0.35 });
  cerca.observe(grillaCopas);
  visible.observe(grillaCopas);
}

const anio = document.getElementById('anio');
if (anio) anio.textContent = new Date().getFullYear();

// Cintas sin corte: la pista se repite hasta que la mitad (lo que recorre la animación) cubra la pantalla.
// La duración crece con las copias para que la velocidad no cambie.
document.fonts.ready.then(() => {
  for (const pista of document.querySelectorAll('.cinta__pista')) {
    const texto = pista.firstElementChild;
    const copias = 2 * Math.ceil(innerWidth / texto.offsetWidth);
    if (copias <= 2) continue;
    const base = parseFloat(getComputedStyle(pista).animationDuration);
    while (pista.children.length < copias) pista.append(pista.lastElementChild.cloneNode(true));
    pista.style.animationDuration = `${base * copias / 2}s`;
  }
});

// Hero animado con el scroll: el logo vuelve al menú, el video se apaga, entra «Ponle corazón.»
// y luego el subtítulo. Sin JS o con movimiento reducido queda la escena final, quieta.
const menu = document.querySelector('.menu');
const hero = document.querySelector('.hero');
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (t) => 1 - (1 - t) ** 3;
const mezcla = (a, b, t) => a + (b - a) * t;
let progresoHero = 1; // fuera del modo animado, el menú se comporta como siempre

if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero.classList.add('hero--animado');
  const escena = hero.querySelector('.hero__escena');
  const video = hero.querySelector('.hero__video');
  const titulo = hero.querySelector('h1');
  const ponle = hero.querySelector('.hero__ponle');
  const corazon = hero.querySelector('.hero__corazon');
  const sub = hero.querySelector('.hero__sub');
  const enlaceLogo = document.querySelector('.menu__logo');
  const logo = enlaceLogo?.querySelector('img');
  let pendiente = false;

  const pintar = () => {
    pendiente = false;
    const caja = hero.getBoundingClientRect();
    const recorrido = hero.offsetHeight - escena.offsetHeight;
    const p = tramo(-caja.top, 0, recorrido);
    progresoHero = p;
    hero.style.setProperty('--cinta-visible', `${Math.max(0, caja.top)}px`);

    // 1. El logo, grande en el centro de la escena, vuelve a su sitio en el menú.
    if (logo) {
      const t = suave(tramo(p, 0, 0.16));
      const r = enlaceLogo.getBoundingClientRect();
      const ancho = innerWidth * (innerWidth < 768 ? 0.9 : 0.46);
      const arriba = Math.max(caja.top, 0);
      const dx = innerWidth / 2 - (r.left + r.width / 2);
      const dy = (arriba + Math.min(caja.top + escena.offsetHeight, innerHeight)) / 2 - (r.top + r.height / 2);
      const s = ancho / r.width;
      logo.style.transform = t < 1 ? `translate(${mezcla(dx, 0, t)}px, ${mezcla(dy, 0, t)}px) scale(${mezcla(s, 1, t)})` : '';
    }

    // 2. El video arranca apagado (contraste ≥ 3:1 con el logo naranja) y baja un poco más.
    video.style.opacity = mezcla(0.3, 0.18, suave(tramo(p, 0.05, 0.25)));

    // 3. «Ponle» entra en diagonal desde arriba a la izquierda y «corazón.» desde abajo a la derecha,
    // girados 10° en sentidos opuestos, hundiéndose hasta alinearse rectas en el centro.
    const e = suave(tramo(p, 0.18, 0.5));
    const fuera = innerWidth * 0.75;
    const alto = innerHeight * 0.18;
    const escala = mezcla(1.6, 1, e);
    const giro = mezcla(10, 0, e);
    ponle.style.transform = `translate(${mezcla(-fuera, 0, e)}px, ${mezcla(-alto, 0, e)}px) rotate(${-giro}deg) scale(${escala})`;
    corazon.style.transform = `translate(${mezcla(fuera, 0, e)}px, ${mezcla(alto, 0, e)}px) rotate(${giro}deg) scale(${escala})`;
    ponle.style.opacity = corazon.style.opacity = e;

    // 4. Apenas se alinean, el título sube un poco y el subtítulo entra desde abajo.
    const u = suave(tramo(p, 0.5, 0.77));
    const hueco = (sub.offsetHeight + parseFloat(getComputedStyle(sub.parentElement).rowGap)) / 2;
    titulo.style.transform = `translateY(${mezcla(hueco, 0, u)}px)`;
    sub.style.transform = `translateY(${mezcla(innerHeight * 0.5, 0, u)}px)`;
    sub.style.opacity = u;

    menu?.classList.toggle('menu--solido', p >= 0.16);
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  document.fonts.ready.then(pedir);
  pintar();
}

// Al empezar el scroll el menú toma su bloque crema (igual que en hover), sin sombras.
if (menu) {
  const alternar = () => { if (progresoHero >= 1) menu.classList.toggle('menu--solido', scrollY > 8); };
  addEventListener('scroll', alternar, { passive: true });
  alternar();
}

// El hero termina en el borde inferior de la ventana: descuenta la cinta superior.
const cintaSuperior = document.getElementById('cinta-superior');
if (cintaSuperior) {
  const medir = () => document.documentElement.style.setProperty('--alto-cinta', `${cintaSuperior.offsetHeight}px`);
  new ResizeObserver(medir).observe(cintaSuperior);
  medir();
}

// Móvil: el botón de hamburguesa abre y cierra el panel con enlaces e iconos.
const burger = menu?.querySelector('.menu__burger');
if (burger) {
  const abrir = (si) => {
    menu.classList.toggle('menu--abierto', si);
    burger.setAttribute('aria-expanded', String(si));
    burger.setAttribute('aria-label', si ? 'Cerrar el menú' : 'Abrir el menú');
  };
  burger.addEventListener('click', () => abrir(!menu.classList.contains('menu--abierto')));
  menu.addEventListener('click', (e) => { if (e.target.closest('.menu__barra > nav a')) abrir(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('menu--abierto')) { abrir(false); burger.focus(); } });
  addEventListener('click', (e) => { if (!menu.contains(e.target)) abrir(false); });
  addEventListener('resize', () => { if (innerWidth >= 768) abrir(false); });
}

// Marca gigante: como si una cámara orbitara la copa. El scroll elige cuál de los 95 fotogramas
// (sacados de imagenes/Aperol_Spritz_camera_orbit.mp4) se dibuja en un canvas.
const copaMarca = document.querySelector('.marca__copa');
if (copaMarca && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const TOTAL = 95;
  const seccion = copaMarca.closest('.marca');
  const lienzo = document.createElement('canvas');
  lienzo.className = copaMarca.className;
  lienzo.width = 400; lienzo.height = 834;
  lienzo.setAttribute('aria-hidden', 'true');
  const ctx = lienzo.getContext('2d');
  const fotos = [];
  let actual = -1, pendiente = false;

  const dibujar = () => {
    pendiente = false;
    const r = seccion.getBoundingClientRect();
    // 0 cuando la escena se fija arriba, 1 cuando se suelta: la vuelta ocurre durante el 150 % extra de la sección.
    const avance = -r.top / (r.height - innerHeight);
    const i = Math.round(Math.min(1, Math.max(0, avance)) * (TOTAL - 1));
    // Si el fotograma aún no llegó, se usa el cargado más cercano hacia atrás.
    for (let j = i; j >= 0; j--) {
      if (fotos[j]?.complete && fotos[j].naturalWidth) {
        if (j !== actual) { ctx.clearRect(0, 0, lienzo.width, lienzo.height); ctx.drawImage(fotos[j], 0, 0, lienzo.width, lienzo.height); actual = j; }
        return;
      }
    }
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(dibujar); } };

  // Los fotogramas se piden recién cuando la sección está por aparecer.
  const cerca = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    cerca.disconnect();
    for (let n = 0; n < TOTAL; n++) {
      const f = new Image();
      f.decoding = 'async';
      f.onload = pedir;
      f.src = `img/orbita/${String(n + 1).padStart(3, '0')}.webp`;
      fotos[n] = f;
    }
    fotos[0].addEventListener('load', () => copaMarca.replaceWith(lienzo), { once: true });
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
  }, { rootMargin: '600px 0px' });
  cerca.observe(seccion);
}
