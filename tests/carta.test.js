import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatoPrecio, cartaAHtml } from '../js/carta-html.js';

const leer = (ruta) => fs.readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');
const carta = JSON.parse(leer('data/carta.json'));
const grupo = (id) => carta.secciones.flatMap((s) => s.grupos).find((g) => g.id === id);

test('conteo de items por grupo igual al PDF', () => {
  const esperado = { calientes: 8, frias: 6, combos: 4, dulce: 4, salado: 6, spritz: 8, birras: 7, 'sin-alcohol': 6, picar: 3 };
  for (const [id, n] of Object.entries(esperado)) assert.equal(grupo(id).items.length, n, id);
});

test('precios de control', () => {
  const p = (g, n) => grupo(g).items.find((i) => i.nombre === n).precio;
  assert.equal(p('calientes', 'Tinto'), 2);
  assert.equal(p('frias', 'Granizado de café'), 12.9);
  assert.equal(p('combos', 'Combo Dolce'), 18.9);
  assert.equal(p('salado', 'Pastel Il Rustico'), 10.9);
  assert.equal(p('spritz', 'Aperol Spritz'), 28);
  assert.equal(p('birras', 'Peroni Nastro Azzurro'), 15);
  assert.equal(p('sin-alcohol', 'Sanpellegrino Zero'), 13.9);
  assert.equal(p('picar', 'Tabla madurados-queso'), 65);
});

test('formatoPrecio', () => {
  assert.equal(formatoPrecio(2), '$2k');
  assert.equal(formatoPrecio(4.9), '$4.9k');
  assert.equal(formatoPrecio(28), '$28k');
});

test('cartaAHtml escapa y estructura', () => {
  const html = cartaAHtml({ secciones: [{ id: 'x', titulo: 'X', grupos: [{ id: 'g', titulo: 'G', items: [{ nombre: 'A & B', precio: 4.9 }] }] }], promos: [] });
  assert.match(html, /<section id="x"/);
  assert.match(html, /A &amp; B/);
  assert.match(html, /<span class="carta__precio">\$4\.9k<\/span>/);
});

test('carta.html está generada con los datos actuales', () => {
  assert.ok(leer('carta.html').includes(cartaAHtml(carta)));
});
