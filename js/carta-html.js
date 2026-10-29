// Convierte data/carta.json en el HTML de la carta. Lo usa tools/build-carta.mjs.

const escapar = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Igual que el PDF: precios en miles, sin ceros de más (2, 4.9, 28).
export const formatoPrecio = (n) => String(n);

const item = ({ nombre, precio, detalle }) =>
  `<li class="carta__item"><span class="carta__nombre">${escapar(nombre)}</span>` +
  `<span class="carta__precio">${formatoPrecio(precio)}</span>` +
  (detalle ? `<span class="carta__detalle">${escapar(detalle)}</span>` : '') +
  `</li>`;

const grupo = (g) =>
  `<div class="carta__grupo" id="${g.id}"><h3>${escapar(g.titulo)}</h3>` +
  `<ul class="carta__lista">${g.items.map(item).join('')}</ul></div>`;

export function cartaAHtml(carta) {
  const secciones = carta.secciones.map((s) =>
    `<section id="${s.id}" class="carta__seccion" aria-labelledby="${s.id}-titulo">` +
    `<h2 id="${s.id}-titulo">${escapar(s.titulo)}</h2>` +
    `<div class="carta__grupos">${s.grupos.map(grupo).join('')}</div></section>`
  ).join('\n');
  const promos = carta.promos.length
    ? `\n<ul class="carta__promos">${carta.promos.map((p) => `<li>${escapar(p.texto)}</li>`).join('')}</ul>`
    : '';
  return secciones + promos;
}
