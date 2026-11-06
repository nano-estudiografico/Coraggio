// Al abrir carta.html trae los precios actuales de la hoja de Drive y reemplaza la carta.
// Si la hoja no responde, queda la carta generada en el HTML.
import { HOJA_CSV, hojaACarta } from './carta-hoja.js';
import { cartaAHtml } from './carta-html.js';
import { traducirEn } from './carta-en.js';

const destino = document.getElementById('carta-viva');
if (destino) {
  fetch(HOJA_CSV, { cache: 'no-store' })
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((csv) => {
      const carta = hojaACarta(csv);
      if (carta.secciones.length) destino.innerHTML = cartaAHtml(carta, document.documentElement.lang.startsWith('en') ? traducirEn : undefined);
    })
    .catch(() => {});
}
