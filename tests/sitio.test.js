import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const leer = (ruta) => fs.readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');

const inicio = () => leer('index.html');
const paginasYEstilos = () => ['index.html', 'carta.html', 'en.html', 'carta-en.html', ...fs.readdirSync(new URL('../css', import.meta.url)).map(f => `css/${f}`)].map(leer);

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
  assert.match(inicio(), /href="carta"[^>]*>\s*Ver la carta/);
  assert.match(inicio(), /href="https:\/\/www\.rappi\.com\.co\/restaurantes\/delivery\/373002-coraggio-aperitivos"[^>]*>\s*Pedir a domicilio/);
});

test('secciones 8-16 presentes en orden después de firma', () => {
  const ids = ['firma', 'resenas', 'cinta-animo', 'marca', 'momentos', 'historia', 'instagram', 'visitanos'];
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

test('recetas con medidas exactas, en el reverso de las copas', () => {
  for (const id of ['copas']) {
    const seccion = inicio().match(new RegExp(`<section class="${id}"[\\s\\S]*?</section>`))[0];
    assert.equal((seccion.match(/90 ml de prosecco/g) || []).length, 3, id);
    for (const l of ['Aperol', 'Campari', 'limoncello']) assert.match(seccion, new RegExp(`60 ml de ${l}`), id);
  }
});

test('visítanos: dirección, horario escrito, contacto', () => {
  assert.match(inicio(), /Cra\. 43A #33-57, Local 167/);
  assert.match(inicio(), /Todos los días, 9:00 a\. m\. – 9:00 p\. m\./);
  assert.match(inicio(), /wa\.me\/message\/XNE77YPUTSUAP1/);
  assert.match(inicio(), /mailto:coraggioaperitivos@gmail\.com/);
  assert.match(inicio(), /pan de masa madre, tortas y desayunos empresariales/i);
});

test('precios del inicio con signo pesos y k', () => {
  assert.equal((inicio().match(/<p class="copa__precio">\$28k<\/p>/g) || []).length, 3);
  assert.match(inicio(), /<p class="copa__precio">\$15k<\/p>/);
  assert.match(inicio(), /2 spritz × \$50k/);
  assert.match(inicio(), /2 copas × \$30k/);
  assert.doesNotMatch(inicio(), /\d mil\b/);
});

test('menú con Carta, Visítanos y Pedir en Rappi', () => {
  const menu = inicio().match(/<ul class="menu__enlaces">[\s\S]*?<\/ul>/)[0];
  for (const t of ['Carta', 'Visítanos', 'Pedir']) assert.match(menu, new RegExp(`>\\s*${t}\\s*<`));
  assert.match(menu, /href="https:\/\/www\.rappi\.com\.co\/[^"]*"[^>]*>\s*Pedir\s*</);
});

test('toda imagen que usan las páginas existe y las fotos pesan menos de 600 KB', () => {
  const rutas = new Set(paginasYEstilos().flatMap(t => t.match(/img\/[\w/.-]+\.(?:jpg|png|svg|webp)/g) || []));
  assert.ok(rutas.size > 0);
  for (const r of rutas) {
    const { size } = fs.statSync(new URL(`../${r}`, import.meta.url));
    if (/\.(jpg|webp)$/.test(r)) assert.ok(size < 600_000, `${r} pesa ${size}`);
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

const todas = [...paginas, 'en.html', 'carta-en.html'];

test('enlaces de solo ícono tienen aria-label', () => {
  for (const p of todas) for (const a of leer(p).match(/<a [^>]*class="[^"]*icono[^"]*"[^>]*>/g) || []) assert.match(a, /aria-label="/, a);
});

test('externos con target _blank y rel noopener', () => {
  for (const p of todas) for (const a of leer(p).match(/<a [^>]*href="https?:[^>]*>/g)) {
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
    // Las redes solo leen og:image con dirección completa; además la imagen debe existir en el proyecto.
    const og = h.match(/<meta property="og:image" content="https:\/\/coraggioaperitivos\.com\/([^"]+)"/);
    assert.ok(og, `${p}: og:image debe ser una URL completa`);
    assert.ok(fs.existsSync(new URL(`../${og[1]}`, import.meta.url)), `${p}: no existe ${og[1]}`);
    assert.match(h, /<link rel="icon" href="favicon\.svg"/);
  }
  const ld = JSON.parse(inicio().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(ld['@type'], ['CafeOrCoffeeShop', 'BarOrPub']);
  assert.equal(ld.url, 'https://coraggioaperitivos.com/');
  assert.equal(ld.hasMenu, 'https://coraggioaperitivos.com/carta');
  assert.ok(!('aggregateRating' in ld), 'sin aggregateRating: Google no admite reseñas propias en LocalBusiness');
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
    // Excepciones: @keyframes (terminan visibles y reduced-motion los apaga), reglas de
    // .menu--abierto, estados que solo existen después de un clic, y contenido de un details
    // cerrado (el navegador ya lo oculta; la opacidad solo sirve para el fundido al cerrar).
    // También .momentos--espera / .momentos--animada (solo las pone js/main.js) y los adornos del pie
    // (hielos, vapor, leche), que se alternan entre la escena aperitivo y la café.
    const enReposo = css
      .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '')
      .replace(/\.menu--abierto[^{]*\{[^}]*\}/g, '')
      .replace(/\.momentos--(espera|animada)[^{]*\{[^}]*\}/g, '')
      .replace(/(\.pie--cafe )?\.pie__(hielos|vapor|leche)\s*\{[^}]*\}/g, '')
      .replace(/details:not\(\[open\]\)[^{]*\{[^}]*\}/g, '');
    assert.doesNotMatch(enReposo, /opacity:\s*0\s*[;}]/, `${f}: nada debe arrancar invisible`);
  }
});

test('contenedores de imagen con color de fondo', () => {
  assert.match(leer('css/base.css'), /picture[^{]*\{[^}]*background(-color)?:/);
});

test('sin JS: el estado de horario arranca oculto y el horario está escrito', () => {
  assert.match(inicio(), /<p class="estado" id="estado-horario" hidden><\/p>/);
  assert.match(leer('css/base.css'), /\[hidden\]\s*\{\s*display:\s*none/);
});

test('selector ES | EN en el menú de las cuatro páginas, con la página actual marcada', () => {
  // URLs limpias y relativas (valen en Cloudflare y en GitHub Pages bajo /Coraggio/).
  const pares = { 'index.html': ['\\./', 'en', 'es'], 'en.html': ['\\./', 'en', 'en'],
    'carta.html': ['carta', 'carta-en', 'es'], 'carta-en.html': ['carta', 'carta-en', 'en'] };
  for (const [p, [es, en, actual]] of Object.entries(pares)) {
    const iconos = leer(p).match(/<div class="menu__iconos">[\s\S]*?<\/div>/)[0];
    const sel = iconos.match(/<p class="idioma">[\s\S]*?<\/p>/)?.[0];
    assert.ok(sel, `${p}: falta el selector de idioma`);
    assert.match(sel, new RegExp(`href="${es}"[^>]*>ES<`), p);
    assert.match(sel, new RegExp(`href="${en}"[^>]*>EN<`), p);
    assert.match(sel, new RegExp(`lang="${actual}"[^>]*aria-current="page"`), p);
    assert.match(leer(p), new RegExp(`<link rel="alternate" hreflang="en" href="[^"]*${en}">`), p);
  }
});

test('versión en inglés: idioma, enlaces internos y avisos legales', () => {
  for (const p of ['en.html', 'carta-en.html']) {
    const h = leer(p);
    assert.match(h, /<meta property="og:image" content="https:\/\/coraggioaperitivos\.com\/img\/thumbnail\.jpg">/, p);
    assert.match(h, /<html lang="en">/, p);
    assert.match(h, /Excessive alcohol consumption is harmful to your health\. Sale of alcoholic beverages to minors is prohibited\./, p);
    assert.match(h, /Prices in thousands of Colombian pesos\. Consumption tax included\./, p);
    // Fuera del selector de idioma, ningún enlace interno lleva a las páginas en español.
    const sinSelector = h.replace(/<p class="idioma">[\s\S]*?<\/p>/, '').replace(/<link rel="alternate"[^>]*>/g, '');
    assert.doesNotMatch(sinSelector, /href="(\.?\/|\.?\/?carta)(#[^"]*)?"/, p);
  }
  assert.match(leer('en.html'), /Not every spritz tastes the same\./);
  assert.match(leer('en.html'), /Every day, 9:00 a\.m\. – 9:00 p\.m\./);
  assert.match(leer('en.html'), /<p class="estado" id="estado-horario" hidden><\/p>/);
});

test('SEO: canonical, hreflang, og:url, robots.txt y sitemap apuntan a coraggioaperitivos.com', () => {
  const D = 'https://coraggioaperitivos.com/';
  const urls = { 'index.html': D, 'en.html': `${D}en`, 'carta.html': `${D}carta`, 'carta-en.html': `${D}carta-en` };
  const sitemap = leer('sitemap.xml');
  for (const [p, url] of Object.entries(urls)) {
    const h = leer(p);
    assert.match(h, new RegExp(`<link rel="canonical" href="${url}">`), p);
    assert.match(h, new RegExp(`<meta property="og:url" content="${url}">`), p);
    for (const l of ['es', 'en', 'x-default']) assert.match(h, new RegExp(`<link rel="alternate" hreflang="${l}" href="${D}`), `${p}: hreflang ${l}`);
    assert.doesNotMatch(h, /github\.io/, p);
    assert.doesNotMatch(h, /href="[^"]*\.html/, `${p}: enlaces internos sin .html (Cloudflare Pages redirige a la URL limpia)`);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `${p} no está en el sitemap`);
  }
  assert.match(leer('robots.txt'), /^Allow: \/$/m);
  assert.match(leer('robots.txt'), /^Sitemap: https:\/\/coraggioaperitivos\.com\/sitemap\.xml$/m);
  assert.match(leer('404.html'), /<meta name="robots" content="noindex">/);
  const cab = leer('_headers');
  for (const c of ['Content-Security-Policy', 'X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']) assert.ok(cab.includes(c), `_headers sin ${c}`);
  // Workers rechaza URLs absolutas en _redirects (error 100324): www se redirige con una Redirect Rule del panel.
  assert.doesNotMatch(leer('_redirects'), /^\s*https?:\/\//m);
  const wr = leer('wrangler.jsonc');
  assert.match(wr, /"not_found_handling":\s*"404-page"/, 'sin 404 propia en el Worker');
  const ign = leer('.assetsignore');
  for (const d of ['.git', 'Base', 'docs', 'tests', 'tools']) assert.match(ign, new RegExp(`^${d.replace('.', '\\.')}$`, 'm'), `.assetsignore no excluye ${d}`);
});
