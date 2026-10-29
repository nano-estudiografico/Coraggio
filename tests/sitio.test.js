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

test('secciones 8-16 presentes en orden después de firma', () => {
  const ids = ['firma', 'resenas', 'cinta-animo', 'marca', 'momentos', 'historia', 'recetas', 'instagram', 'visitanos'];
  const pos = ids.map((id) => inicio().indexOf(`id="${id}"`));
  assert.ok(pos.every((p) => p > 0), pos.join());
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});

test('las cuatro reseñas reales, con 4,9 y 31 reseñas', () => {
  for (const n of ['Mariana Rodriguez', 'Ale', 'Dayana Guerrero', 'Guillermo Yepes']) assert.match(inicio(), new RegExp(n));
  assert.match(inicio(), /los mejores Aperol de Medallo/);
  assert.match(inicio(), /4,9/);
  assert.match(inicio(), /31 reseñas/);
});

test('recetas con medidas exactas', () => {
  assert.equal((inicio().match(/90 ml de prosecco/g) || []).length, 3);
  for (const l of ['Aperol', 'Campari', 'limoncello']) assert.match(inicio(), new RegExp(`60 ml de ${l}`));
});

test('visítanos: dirección, horario escrito, contacto', () => {
  assert.match(inicio(), /Cra\. 43A #33-57, Local 167/);
  assert.match(inicio(), /Todos los días, 9:00 a\. m\. – 9:00 p\. m\./);
  assert.match(inicio(), /wa\.me\/message\/XNE77YPUTSUAP1/);
  assert.match(inicio(), /mailto:coraggioaperitivos@gmail\.com/);
  assert.match(inicio(), /pan de masa madre, tortas y desayunos empresariales/i);
});

test('barra móvil con tres acciones', () => {
  const barra = inicio().match(/<nav class="barra-movil"[\s\S]*?<\/nav>/)[0];
  for (const t of ['Carta', 'Cómo llegar', 'Pedir']) assert.match(barra, new RegExp(`>\\s*${t}\\s*<`));
});

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

const paginas = ['index.html', 'carta.html'];

test('toda imagen tiene alt y no vacío salvo decorativas', () => {
  for (const p of paginas) for (const img of leer(p).match(/<img[^>]*>/g)) {
    assert.match(img, /alt="/, `${p}: ${img}`);
    if (!/alt=""/.test(img)) continue;
    assert.ok(leer(p).includes('aria-hidden="true"'), `${p}: imagen sin alt fuera de un bloque decorativo`);
  }
});

test('enlaces de solo ícono tienen aria-label', () => {
  for (const p of paginas) for (const a of leer(p).match(/<a [^>]*class="[^"]*icono[^"]*"[^>]*>/g) || []) assert.match(a, /aria-label="/, a);
});

test('externos con target _blank y rel noopener', () => {
  for (const p of paginas) for (const a of leer(p).match(/<a [^>]*href="https?:[^>]*>/g)) {
    assert.match(a, /target="_blank"/, a);
    assert.match(a, /rel="noopener"/, a);
  }
});

test('avisos legales literales en ambas páginas', () => {
  for (const p of paginas) {
    assert.ok(leer(p).includes('El exceso de alcohol es perjudicial para la salud. Prohíbase el expendio de bebidas embriagantes a menores de edad.'), p);
    assert.ok(leer(p).includes('Precios en miles de pesos. Incluyen impuesto al consumo.'), p);
  }
});

test('metadatos y datos estructurados', () => {
  for (const p of paginas) {
    const h = leer(p);
    assert.match(h, /<html lang="es-CO">/);
    assert.match(h, /<meta name="description"/);
    assert.match(h, /<meta property="og:image" content="img\/tres-spritz-1920\.jpg"/);
    assert.match(h, /<link rel="icon" href="favicon\.svg"/);
  }
  const ld = JSON.parse(inicio().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld['@type'], 'BarOrPub');
  assert.equal(ld.address.addressLocality, 'Medellín');
  assert.equal(ld.telephone, '+57 300 700 2822');
  assert.equal(ld.openingHoursSpecification.opens, '09:00');
  assert.equal(ld.openingHoursSpecification.closes, '21:00');
});

test('sin localStorage, animaciones con reduced-motion y nada arranca invisible', () => {
  assert.doesNotMatch(inicio(), /localStorage/);
  assert.doesNotMatch(leer('js/main.js'), /localStorage/);
  for (const f of ['css/base.css', 'css/inicio.css', 'css/carta.css']) {
    const css = leer(f);
    if (/@keyframes|animation:|transition:/.test(css)) assert.match(css, /prefers-reduced-motion/, f);
    assert.doesNotMatch(css, /opacity:\s*0\s*[;}]/, `${f}: nada debe arrancar invisible`);
  }
});

test('contenedores de imagen con color de fondo', () => {
  assert.match(leer('css/base.css'), /picture[^{]*\{[^}]*background(-color)?:/);
});

test('sin JS: el estado de horario arranca oculto y el horario está escrito', () => {
  assert.match(inicio(), /<p class="estado" id="estado-horario" hidden><\/p>/);
  assert.match(leer('css/base.css'), /\[hidden\]\s*\{\s*display:\s*none/);
});
