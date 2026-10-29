import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const leer = (ruta) => fs.readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');

test('los tres logos existen, son SVG con viewBox y título', () => {
  for (const f of ['completo', 'horizontal', 'circulo']) {
    const svg = leer(`img/logo/coraggio-${f}.svg`);
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.match(svg, /<title[^>]*>Coraggio Aperitivos<\/title>/);
    assert.doesNotMatch(svg, /<image/); // vector puro, sin bitmap incrustado
  }
});
