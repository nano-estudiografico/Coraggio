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
