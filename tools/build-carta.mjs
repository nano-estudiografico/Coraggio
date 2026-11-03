// Uso: npm run carta — baja la carta de la hoja de Drive a data/carta.json y reescribe el bloque de carta.html.
// Si la hoja no responde, usa el data/carta.json que ya hay.
import fs from 'node:fs';
import { cartaAHtml } from '../js/carta-html.js';
import { HOJA_CSV, hojaACarta } from '../js/carta-hoja.js';

const raiz = new URL('../', import.meta.url);
const rutaJson = new URL('data/carta.json', raiz);

try {
  const r = await fetch(HOJA_CSV);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const carta = hojaACarta(await r.text());
  if (!carta.secciones.length) throw new Error('la hoja no tiene filas válidas (¿está compartida con el enlace?)');
  fs.writeFileSync(rutaJson, JSON.stringify(carta, null, 2) + '\n');
  console.log('data/carta.json actualizado desde la hoja');
} catch (e) {
  console.warn(`No se pudo leer la hoja (${e.message}); uso data/carta.json`);
}

const carta = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
const ruta = new URL('carta.html', raiz);
const html = fs.readFileSync(ruta, 'utf8');

const INICIO = '<!-- CARTA:INICIO -->';
const FIN = '<!-- CARTA:FIN -->';
const a = html.indexOf(INICIO);
const b = html.indexOf(FIN);
if (a < 0 || b < a) throw new Error('carta.html no tiene los marcadores CARTA:INICIO / CARTA:FIN');

fs.writeFileSync(ruta, `${html.slice(0, a + INICIO.length)}\n${cartaAHtml(carta)}\n${html.slice(b)}`);
console.log('carta.html actualizada');
