import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const leer = (ruta) => fs.readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');

const IMAGENES = ['aperol-spritz', 'campari-spritz', 'limoncello-spritz', 'tres-spritz', 'mimosas', 'cafe-frio', 'capuchino', 'pasteleria', 'tabla-picar', 'salon', 'tazas-momentos'];
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
