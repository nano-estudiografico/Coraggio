// Convierte data/carta.json en el HTML de la carta. Lo usa tools/build-carta.mjs.
// t traduce cada texto visible (por defecto lo deja igual; carta-en.html usa traducirEn).

const escapar = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Precios en miles con signo pesos y k: 2 → $2k, 4.9 → $4.9k, 28 → $28k.
export const formatoPrecio = (n) => `$${n}k`;

const item = (t) => ({ nombre, precio, detalle }) =>
  `<li class="carta__item"><span class="carta__nombre">${escapar(t(nombre))}</span>` +
  `<span class="carta__precio">${formatoPrecio(precio)}</span>` +
  (detalle ? `<span class="carta__detalle">${escapar(t(detalle))}</span>` : '') +
  `</li>`;

const grupo = (t) => (g) =>
  `<div class="carta__grupo" id="${g.id}"><h3>${escapar(t(g.titulo))}</h3>` +
  `<ul class="carta__lista">${g.items.map(item(t)).join('')}</ul></div>`;

export function cartaAHtml(carta, t = (s) => s) {
  const secciones = carta.secciones.map((s) =>
    `<section id="${s.id}" class="carta__seccion" aria-labelledby="${s.id}-titulo">` +
    `<h2 id="${s.id}-titulo">${escapar(t(s.titulo))}</h2>` +
    `<div class="carta__grupos">${s.grupos.map(grupo(t)).join('')}</div></section>`
  ).join('\n');
  const promos = carta.promos.length
    ? `\n<ul class="carta__promos">${carta.promos.map((p) => `<li>${escapar(t(p.texto))}</li>`).join('')}</ul>`
    : '';
  return secciones + promos;
}
