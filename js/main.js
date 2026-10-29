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

// Al empezar el scroll el menú toma su bloque crema (igual que en hover), sin sombras.
const menu = document.querySelector('.menu');
if (menu) {
  const alternar = () => menu.classList.toggle('menu--solido', scrollY > 8);
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
