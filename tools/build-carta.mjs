// Uso: npm run carta — reescribe el bloque de carta.html con los datos de data/carta.json.
import fs from 'node:fs';
import { cartaAHtml } from '../js/carta-html.js';

const raiz = new URL('../', import.meta.url);
const carta = JSON.parse(fs.readFileSync(new URL('data/carta.json', raiz), 'utf8'));
const ruta = new URL('carta.html', raiz);
const html = fs.readFileSync(ruta, 'utf8');

const INICIO = '<!-- CARTA:INICIO -->';
const FIN = '<!-- CARTA:FIN -->';
const a = html.indexOf(INICIO);
const b = html.indexOf(FIN);
if (a < 0 || b < a) throw new Error('carta.html no tiene los marcadores CARTA:INICIO / CARTA:FIN');

fs.writeFileSync(ruta, `${html.slice(0, a + INICIO.length)}\n${cartaAHtml(carta)}\n${html.slice(b)}`);
console.log('carta.html actualizada');
