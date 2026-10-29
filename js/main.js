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
