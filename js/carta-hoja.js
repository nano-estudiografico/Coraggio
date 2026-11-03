// Lee la carta desde la hoja de cálculo de Drive «Carta Coraggio (precios web)».
// Columnas: Sección | Grupo | Nombre | Precio | Detalle. Las filas con Sección «Promos» son promos (texto en Nombre).
// La hoja debe estar compartida como «cualquier persona con el enlace puede ver».

export const HOJA_ID = '16phbt83foQsoDgri45PA2p2ITIB9kqfKoeVUA31lGcw';
export const HOJA_CSV = `https://docs.google.com/spreadsheets/d/${HOJA_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=Carta`;

// Ids de siempre, para no romper los enlaces del índice (#combos, #picar…). Lo nuevo se convierte en slug.
const IDS = {
  'café': 'cafe', 'aperitivos': 'aperitivos', 'bebidas calientes': 'calientes', 'bebidas frías': 'frias',
  'combos': 'combos', 'para acompañar: dulce': 'dulce', 'para acompañar: salado': 'salado',
  'spritz y copas': 'spritz', 'birras': 'birras', 'sin alcohol': 'sin-alcohol', 'para picar': 'picar',
};
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const idDe = (titulo) => IDS[titulo.toLowerCase()] ?? slug(titulo);

export function leerCsv(texto) {
  const filas = [];
  let fila = [], celda = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { celda += '"'; i++; }
      else if (c === '"') comillas = false;
      else celda += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(celda); celda = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(celda); filas.push(fila); fila = []; celda = '';
    } else celda += c;
  }
  if (celda || fila.length) { fila.push(celda); filas.push(fila); }
  return filas;
}

// Precio en miles: acepta 4.9, 4,9, $4.9k o 4900 (pesos completos) → 4.9.
export function leerPrecio(valor) {
  let n = parseFloat(String(valor).replace(/[^\d.,]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1000) n /= 1000;
  return Math.round(n * 10) / 10;
}

export function hojaACarta(csv) {
  const [, ...filas] = leerCsv(csv);
  const carta = { secciones: [], promos: [] };
  for (const [seccion = '', grupo = '', nombre = '', precio = '', detalle = ''] of filas.map((f) => f.map((c) => c.trim()))) {
    if (!nombre) continue;
    if (seccion.toLowerCase() === 'promos') { carta.promos.push({ texto: nombre }); continue; }
    const p = leerPrecio(precio);
    if (!seccion || !grupo || p === null) continue;
    let s = carta.secciones.find((x) => x.titulo === seccion);
    if (!s) carta.secciones.push(s = { id: idDe(seccion), titulo: seccion, grupos: [] });
    let g = s.grupos.find((x) => x.titulo === grupo);
    if (!g) s.grupos.push(g = { id: idDe(grupo), titulo: grupo, items: [] });
    g.items.push(detalle ? { nombre, precio: p, detalle } : { nombre, precio: p });
  }
  return carta;
}
