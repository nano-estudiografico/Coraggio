import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const leer = (ruta) => fs.readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');

const inicio = () => leer('index.html');

test('secciones 1-7 presentes en orden', () => {
  const ids = ['cinta-superior', 'inicio', 'frase', 'copas', 'dia-y-tarde', 'firma'];
  const pos = ids.map((id) => inicio().indexOf(`id="${id}"`));
  assert.ok(pos.every((p) => p > 0), pos.join());
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});

test('frase de marca y definición literales', () => {
  assert.match(inicio(), /No todos los spritz saben a lo mismo\./);
  assert.match(inicio(), /co-rà-ggio/);
  assert.match(inicio(), /vivir con el corazón por delante/);
});

test('hero con Ver la carta y Pedir a domicilio', () => {
  assert.match(inicio(), /href="carta\.html"[^>]*>\s*Ver la carta/);
  assert.match(inicio(), /href="https:\/\/www\.rappi\.com\.co\/restaurantes\/delivery\/373002-coraggio-aperitivos"[^>]*>\s*Pedir a domicilio/);
});

const IMAGENES =['aperol-spritz', 'campari-spritz', 'limoncello-spritz', 'tres-spritz', 'mimosas', 'cafe-frio', 'capuchino', 'pasteleria', 'tabla-picar', 'salon', 'tazas-momentos'];
test('cada imagen tiene versión 1920 y 960 de menos de 600 KB', () => {
  for (const n of IMAGENES) for (const t of [1920, 960]) {
    const { size } = fs.statSync(new URL(`../img/${n}-${t}.jpg`, import.meta.url));
    assert.ok(size < 600_000, `${n}-${t} pesa ${size}`);
  }
});

test('los tres logos existen, son SVG con viewBox y título', () => {
  for (const f of ['completo', 'horizontal', 'circulo']) {
    const svg = leer(`img/logo/coraggio-${f}.svg`);
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.match(svg, /<title[^>]*>Coraggio Aperitivos<\/title>/);
    assert.doesNotMatch(svg, /<image/); // vector puro, sin bitmap incrustado
  }
});
