import { estadoHorario } from './horario.js';

const anio = document.getElementById('anio');
if (anio) anio.textContent = new Date().getFullYear();
