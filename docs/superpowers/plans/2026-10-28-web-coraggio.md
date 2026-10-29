# Web de Coraggio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la web estática de Coraggio Aperitivos (inicio de una página + página de carta) descrita en el documento de diseño aprobado.

**Architecture:** HTML, CSS y JavaScript sin framework ni build obligatorio. La carta vive en `data/carta.json` y un script de Node la vuelca como HTML estático dentro de `carta.html` (así se lee sin JavaScript y Google indexa los precios). La lógica con reglas (horario abierto/cerrado, formato de la carta) está en módulos ES pequeños con tests de `node --test`; el resto se verifica con un test de chequeos estáticos sobre el HTML y en el navegador.

**Tech Stack:** HTML5, CSS (custom properties, sin preprocesador), JavaScript ES modules, Node 24 (`node --test`, sin dependencias npm), `sips` de macOS para optimizar imágenes, Google Fonts (Gloock + Instrument Sans).

**Spec:** `docs/2026-10-28-web-coraggio-diseno.md`

## Global Constraints

- Idioma de la web: español (Colombia), `<html lang="es-CO">`. Trato de "tú" como en la marca ("Ponle corazón que tú puedes").
- Sin tienda, carrito, cuentas, reservas, newsletter ni base de datos.
- Sin dependencias npm; Node solo para tests y para `tools/`.
- Colores (tokens en `css/tokens.css`): `--oliva: #303717`, `--naranja: #E8652B`, `--crema: #F4EEE3`, `--blanco: #FFFFFF`. Texto general en oliva sobre crema (10,8:1). Naranja nunca como color de texto sobre crema; sobre oliva solo en títulos ≥ 24 px o negrita. Botones naranjas con texto oliva en negrita.
- Tipografía: display **Gloock** solo en títulos, frases y momentos grandes; texto **Instrument Sans**, tamaño base 17 px (`1.0625rem`), escalas en `rem` para que el zoom de texto funcione.
- Objetivos táctiles ≥ 44 × 44 px; foco visible en todo lo interactivo.
- Todo movimiento (cintas, entradas) se apaga con `prefers-reduced-motion: reduce`.
- Horario: todos los días 09:00–21:00, zona `America/Bogota`.
- Enlaces exactos (copiar tal cual):
  - WhatsApp: `https://wa.me/message/XNE77YPUTSUAP1`
  - Maps: `https://maps.app.goo.gl/ZUkwQF5rzuo5nZUx7`
  - Rappi: `https://www.rappi.com.co/restaurantes/delivery/373002-coraggio-aperitivos`
  - Instagram: `https://www.instagram.com/co.ra.ggio`
  - Reseñas Google: `https://www.google.com/maps/place/Coraggio+Aperitivos/@6.2346475,-75.5694637,17z/data=!4m6!3m5!1s0x8e442976cf9ba0d1:0xa5ca79516951902a`
  - Carta PDF: `https://drive.google.com/file/d/1NCRkEysY1rXxLWQ3CeQs1u3g243O7F9w/view`
  - Correo: `mailto:coraggioaperitivos@gmail.com`; teléfono visible `300 700 2822`.
- Dirección visible: "Cra. 43A #33-57, Local 167 · C.C. Plazuelas de San Diego, Medellín".
- Textos legales literales en inicio y carta: "El exceso de alcohol es perjudicial para la salud. Prohíbase el expendio de bebidas embriagantes a menores de edad." y "Precios en miles de pesos. Incluyen impuesto al consumo."
- Reseñas: solo las cuatro de la sección 4.1 del spec, texto literal.
- Rutas relativas en todo el sitio (se publica sin dominio propio).
- Enlaces externos con `target="_blank" rel="noopener"`.
- No usar `localStorage`.

## Review Focus

1. **Visitante fuera de Colombia o justo a las 21:00** — el indicador debe usar la hora de Bogotá, no la del dispositivo, y a las 21:00:00 debe decir "Cerrado". → `tests/horario.test.js` (Task 3).
2. **Celular de 320 px con texto al 200 %** — nada se corta ni obliga a scroll horizontal; los nombres largos de la carta ("CROSTINIS (x12) PULLED PORK", "PERONI NASTRO AZZURRO") pasan a otra línea sin pisar el precio. → verificación en navegador (Task 8) y regla CSS de la fila de carta (Task 4).
3. **JavaScript desactivado** — la carta, el horario escrito y todos los enlaces siguen visibles; solo se pierde el "Abierto/Cerrado". → test estático (Task 7).
4. **"Reducir movimiento" activado** — las cintas quedan quietas y legibles, ninguna sección queda invisible esperando una animación de entrada. → test estático de CSS (Task 7) y navegador (Task 8).
5. **Imagen que no carga** — cada imagen tiene `alt` descriptivo y su contenedor tiene color de fondo, para que el texto encima siga siendo legible. → test estático (Task 7).

---

## File Structure

```
index.html                 Inicio (secciones 1–16 del spec)
carta.html                 Página de carta; el bloque entre marcadores lo escribe tools/build-carta.mjs
css/tokens.css             Colores, tipografías, espacios, radios
css/base.css               Reset, tipografía base, botones, foco, utilidades, cinta, barra móvil
css/inicio.css             Estilos de secciones del inicio
css/carta.css              Estilos de la carta
js/horario.js              estadoHorario(fecha) — lógica pura
js/carta-html.js           formatoPrecio(), cartaAHtml() — lógica pura usada por el build
js/main.js                 Pinta el estado de horario, carrusel de reseñas, año del pie
data/carta.json            Fuente de verdad de la carta
tools/build-carta.mjs      Lee data/carta.json y reescribe el bloque de carta.html
tools/optimizar-imagenes.sh  imagenes/*.jpg → img/<nombre>-1920.jpg y -960.jpg
img/                       Imágenes optimizadas y logos
img/logo/coraggio-completo.svg, coraggio-horizontal.svg, coraggio-circulo.svg
favicon.svg                Copia de coraggio-circulo.svg
tests/horario.test.js, tests/carta.test.js, tests/sitio.test.js
package.json               {"type":"module","scripts":{"test":"node --test","carta":"node tools/build-carta.mjs","imagenes":"sh tools/optimizar-imagenes.sh"}}
```

---

### Task 1: Base del proyecto, tokens y logo

**Files:**
- Create: `package.json`, `.gitignore`, `css/tokens.css`, `css/base.css`, `img/logo/coraggio-completo.svg`, `img/logo/coraggio-horizontal.svg`, `img/logo/coraggio-circulo.svg`, `favicon.svg`, `tests/sitio.test.js`
- Reference: `Captura de pantalla 2026-10-28 a la(s) 15.16.10.png` (logo)

**Interfaces:**
- Produces: tokens CSS `--oliva --naranja --crema --blanco --font-display --font-texto --texto-base --espacio-1…6 --radio`; clases `.btn`, `.btn--primario` (fondo naranja, texto oliva negrita), `.btn--secundario` (borde oliva), `.visualmente-oculto`, `.cinta` (contenedor) y `.cinta__pista` (pista animada); `tests/sitio.test.js` exporta nada pero define `leer(ruta)` local.

- [ ] **Step 1: Inicializar** — `git init` en la raíz del proyecto, `.gitignore` con `.DS_Store`, `node_modules/`, `Captura de pantalla*` (las capturas quedan fuera del repo), `package.json` con el contenido de File Structure.

- [ ] **Step 2: Test de logos** en `tests/sitio.test.js`:

```js
test('los tres logos existen, son SVG con viewBox y título', () => {
  for (const f of ['completo', 'horizontal', 'circulo']) {
    const svg = leer(`img/logo/coraggio-${f}.svg`);
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.match(svg, /<title>Coraggio Aperitivos<\/title>/);
    assert.doesNotMatch(svg, /<image/); // vector puro, sin bitmap incrustado
  }
});
```

- [ ] **Step 3:** `npm test` → FAIL (archivos inexistentes).

- [ ] **Step 4: Dibujar los logos en SVG** a partir de la captura: círculo `#E8652B` con "C" ornamental en oliva `#303717` (trazos de la C con remates curvos y hojas, aproximando la captura); palabra "CORAGGIO" como trazos (no `<text>`, para no depender de fuentes) en naranja; "APERITIVOS" espaciado con dos virgulillas "~". `completo`: círculo arriba, palabra y "APERITIVOS" debajo (como la captura). `horizontal`: círculo a la izquierda y palabra a la derecha, sin "APERITIVOS". `circulo`: solo el círculo. `favicon.svg` = copia de `circulo`. Para convertir "CORAGGIO" en trazos: componer letras con `<path>` dibujados a mano siguiendo la captura (serif con remates acampanados); no copiar fuentes con licencia.

- [ ] **Step 5:** `npm test` → PASS. Abrir los tres SVG en el navegador junto a la captura y comparar: proporciones, color, legibilidad a 32 px de alto (versión horizontal).

- [ ] **Step 6: Tokens y base** — `css/tokens.css` con los valores de Global Constraints; `css/base.css` con: `@import` de Google Fonts (`Gloock` 400; `Instrument Sans` 400, 600) vía `<link>` en cada HTML (no `@import`), `html{font-size:100%}`, `body{font:var(--texto-base)/1.55 var(--font-texto);color:var(--oliva);background:var(--crema)}`, `:focus-visible{outline:3px solid var(--naranja);outline-offset:3px}`, `.btn` con `min-height:44px`, la animación de `.cinta__pista` (`translateX` infinita, 40 s) y `@media (prefers-reduced-motion: reduce){.cinta__pista{animation:none}}`.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "Base del sitio, tokens y logo de Coraggio"`.

- [ ] **Step 8: Mostrar el logo al usuario** (versión completa y horizontal) y esperar aprobación antes de Task 5. Si pide cambios, ajustar y repetir Step 5.

---

### Task 2: Imágenes optimizadas

**Files:**
- Create: `tools/optimizar-imagenes.sh`, `img/*.jpg`
- Test: `tests/sitio.test.js`

**Interfaces:**
- Produces: para cada `imagenes/<n>.jpg` (excepto `prueba-aperol-spritz.jpg`): `img/<n>-1920.jpg` y `img/<n>-960.jpg` (ancho máximo; `tazas-momentos` vertical: alto máximo 1920/960). Nombres `<n>`: `aperol-spritz campari-spritz limoncello-spritz tres-spritz mimosas cafe-frio capuchino pasteleria tabla-picar salon tazas-momentos`.

- [ ] **Step 1: Test**:

```js
const IMAGENES = ['aperol-spritz','campari-spritz','limoncello-spritz','tres-spritz','mimosas','cafe-frio','capuchino','pasteleria','tabla-picar','salon','tazas-momentos'];
test('cada imagen tiene versión 1920 y 960 de menos de 600 KB', () => {
  for (const n of IMAGENES) for (const t of [1920, 960]) {
    const { size } = fs.statSync(`img/${n}-${t}.jpg`);
    assert.ok(size < 600_000, `${n}-${t} pesa ${size}`);
  }
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** `tools/optimizar-imagenes.sh`: por cada nombre, `sips -Z <t> -s format jpeg -s formatOptions 78 imagenes/<n>.jpg --out img/<n>-<t>.jpg`. Si alguna supera 600 KB, bajar calidad a 70 para esa imagen.
- [ ] **Step 4:** `npm run imagenes && npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -am "Imágenes optimizadas para web"` (incluir `img/` e `imagenes/` con `git add`).

---

### Task 3: Horario abierto/cerrado

**Files:**
- Create: `js/horario.js`, `tests/horario.test.js`

**Interfaces:**
- Produces: `export function estadoHorario(fecha: Date): { abierto: boolean, etiqueta: 'Abierto ahora' | 'Cerrado', detalle: string }`. `detalle` = `'Cierra a las 9:00 p. m.'` si abierto, `'Abre a las 9:00 a. m.'` si cerrado. Calcula la hora en `America/Bogota` con `Intl.DateTimeFormat('en-US',{timeZone:'America/Bogota',hour:'numeric',minute:'numeric',hourCycle:'h23'})`.

- [ ] **Step 1: Tests** (fechas en UTC; Bogotá = UTC−5 todo el año):

```js
const bog = (h, m = 0) => new Date(Date.UTC(2026, 9, 28, h + 5, m)); // hora local Bogotá
test('8:59 cerrado', () => assert.equal(estadoHorario(bog(8, 59)).abierto, false));
test('9:00 abierto', () => assert.deepEqual(estadoHorario(bog(9)), { abierto: true, etiqueta: 'Abierto ahora', detalle: 'Cierra a las 9:00 p. m.' }));
test('20:59 abierto', () => assert.equal(estadoHorario(bog(20, 59)).abierto, true));
test('21:00 cerrado', () => assert.deepEqual(estadoHorario(bog(21)), { abierto: false, etiqueta: 'Cerrado', detalle: 'Abre a las 9:00 a. m.' }));
test('usa la hora de Bogotá aunque sea otro día en UTC', () => assert.equal(estadoHorario(new Date(Date.UTC(2026, 9, 29, 1, 30))).abierto, true)); // 20:30 en Bogotá
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar `estadoHorario`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "Lógica de horario abierto/cerrado"`.

---

### Task 4: Carta (datos, generador y página)

**Files:**
- Create: `data/carta.json`, `js/carta-html.js`, `tools/build-carta.mjs`, `carta.html`, `css/carta.css`, `tests/carta.test.js`

**Interfaces:**
- Consumes: tokens y `.btn` de Task 1; logo horizontal.
- Produces:
  - `data/carta.json` con forma `{ "secciones": [ { "id": "cafe"|"aperitivos", "titulo": string, "grupos": [ { "id": string, "titulo": string, "items": [ { "nombre": string, "precio": number, "detalle"?: string } ] } ] } ], "promos": [ { "texto": string } ] }`. Los combos son un grupo (`id: "combos"`) cuyos items llevan `detalle` con su contenido.
  - `export function formatoPrecio(n: number): string` → igual que el PDF: `2 → "2"`, `4.9 → "4.9"`, `28 → "28"`, `10.9 → "10.9"`.
  - `export function cartaAHtml(carta): string` → HTML de todas las secciones: cada sección `<section id="{id}" aria-labelledby>` con `<h2>`, cada grupo `<h3>` y una `<ul class="carta__lista">` de `<li class="carta__item"><span class="carta__nombre">NOMBRE</span><span class="carta__precio">PRECIO</span>[<span class="carta__detalle">…</span>]</li>`. Escapa `& < >`.
  - `carta.html` contiene `<!-- CARTA:INICIO -->` y `<!-- CARTA:FIN -->`; `tools/build-carta.mjs` reemplaza lo que hay entre ambos con `cartaAHtml(json)`.

- [ ] **Step 1: Tests**:

```js
const carta = JSON.parse(leer('data/carta.json'));
const grupo = id => carta.secciones.flatMap(s => s.grupos).find(g => g.id === id);
test('conteo de items por grupo igual al PDF', () => {
  const esperado = { calientes: 8, frias: 6, combos: 4, dulce: 4, salado: 6, spritz: 8, birras: 7, 'sin-alcohol': 6, picar: 3 };
  for (const [id, n] of Object.entries(esperado)) assert.equal(grupo(id).items.length, n, id);
});
test('precios de control', () => {
  const p = (g, n) => grupo(g).items.find(i => i.nombre === n).precio;
  assert.equal(p('calientes', 'Tinto'), 2);
  assert.equal(p('frias', 'Granizado de café'), 12.9);
  assert.equal(p('combos', 'Combo Dolce'), 18.9);
  assert.equal(p('salado', 'Pastel Il Rustico'), 10.9);
  assert.equal(p('spritz', 'Aperol Spritz'), 28);
  assert.equal(p('birras', 'Peroni Nastro Azzurro'), 15);
  assert.equal(p('sin-alcohol', 'Sanpellegrino Zero'), 13.9);
  assert.equal(p('picar', 'Tabla madurados-queso'), 65);
});
test('formatoPrecio', () => { assert.equal(formatoPrecio(2), '2'); assert.equal(formatoPrecio(4.9), '4.9'); assert.equal(formatoPrecio(28), '28'); });
test('cartaAHtml escapa y estructura', () => {
  const html = cartaAHtml({ secciones: [{ id: 'x', titulo: 'X', grupos: [{ id: 'g', titulo: 'G', items: [{ nombre: 'A & B', precio: 4.9 }] }] }], promos: [] });
  assert.match(html, /<section id="x"/);
  assert.match(html, /A &amp; B/);
  assert.match(html, /<span class="carta__precio">4.9<\/span>/);
});
test('carta.html está generada con los datos actuales', () => {
  assert.ok(leer('carta.html').includes(cartaAHtml(carta)));
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Transcribir `data/carta.json`** desde `CartaCORAGGIO.pdf`, todos los productos y precios. Ids de grupo: `calientes` (Bebidas calientes), `frias` (Bebidas frías, incluye "Chai latte caliente o frío" 9.9), `combos` (Combo Classico 7.9 "Tinto + palito de queso"; Combo Due 12.9 "Latte o café con leche + pastel salado"; Combo Freddo 16.9 "Granizado de café o cold brew + pastel salado"; Combo Dolce 18.9 "Capuccino o americano + torta de zanahoria"), `dulce`, `salado` (Pastel Il Rustico con `detalle` "Salami, pepperoni y queso crema"), `spritz` (Spritz y copas; "(copa)" va en `detalle`), `birras`, `sin-alcohol` ("con/sin azúcar", "con/sin gas" en `detalle`), `picar` (Crostinis pulled pork con `detalle` "x12"). Nombres en tipo oración ("Torta de zanahoria"), no en mayúsculas. Promos: `"2 spritz × 50"`, `"2 copas × 30"`.
- [ ] **Step 4:** Implementar `formatoPrecio` y `cartaAHtml` en `js/carta-html.js`; `tools/build-carta.mjs`.
- [ ] **Step 5: `carta.html`**: `<head>` con título "Carta · Coraggio Aperitivos", descripción, fuentes, CSS; menú igual al de inicio (Task 5 lo reutiliza: mismo marcado copiado); índice de navegación pegajoso con enlaces a `#cafe` y `#aperitivos` y a cada grupo; marcadores; bloque de promos; notas legales literales; bloque de pedidos por encargo con botón WhatsApp; enlace "Descargar carta en PDF"; pie. `css/carta.css`: `.carta__item{display:flex;gap:1rem;justify-content:space-between;align-items:baseline}`, `.carta__nombre{flex:1;min-width:0;overflow-wrap:anywhere}`, `.carta__precio{flex:none;font-variant-numeric:tabular-nums}`; dos columnas de grupos desde 768 px.
- [ ] **Step 6:** `npm run carta && npm test` → PASS.
- [ ] **Step 7: Commit** — `git commit -m "Carta: datos, generador y página"`.

---

### Task 5: Inicio — secciones 1 a 7

**Files:**
- Create: `index.html`, `css/inicio.css`, `js/main.js`
- Modify: `tests/sitio.test.js`

**Interfaces:**
- Consumes: tokens/clases de Task 1, `img/*-1920|960.jpg` de Task 2, logo horizontal, datos de copas desde `data/carta.json` solo como referencia de precios (el HTML lleva los valores escritos: Aperol, Campari y Limoncello Spritz 28; Mimosa 15).
- Produces: marcado del menú (`<header class="menu">` con enlaces `index.html`, `carta.html`, `#visitanos` y los íconos) que carta.html copia igual; `js/main.js` como `<script type="module">`.

- [ ] **Step 1: Tests** en `tests/sitio.test.js`:

```js
const inicio = () => leer('index.html');
test('secciones 1-7 presentes en orden', () => {
  const ids = ['cinta-superior', 'inicio', 'frase', 'copas', 'dia-y-tarde', 'firma'];
  const pos = ids.map(id => inicio().indexOf(`id="${id}"`));
  assert.ok(pos.every(p => p > 0), pos.join());
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
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Marcado y estilos** de las secciones 1–7 según la tabla del spec:
  - Cinta superior (`id="cinta-superior"`): texto duplicado dos veces dentro de `.cinta__pista` (el segundo con `aria-hidden="true"`).
  - Menú fijo con logo horizontal centrado; en < 768 px, logo a la izquierda e íconos a la derecha, sin menú hamburguesa (los tres enlaces caben como texto chico ≥ 15 px o pasan a la barra móvil de Task 6).
  - Hero (`id="inicio"`): `<picture>` con `tres-spritz-960/1920.jpg`, `alt="Tres copas de spritz —Campari, Limoncello y Aperol— sobre una mesa de mármol en Coraggio"`; capa oscura degradada abajo para contraste; título en Gloock "Ponle corazón." (propuesta para revisión del cliente), subtítulo "Café de día, aperitivo italiano de tarde. En San Diego, Medellín."; botones.
  - Frase (`id="frase"`).
  - Copas (`id="copas"`): 4 tarjetas con imagen 960, nombre, descripción (Aperol "Cítrico y agridulce.", Campari "Amargo y con carácter.", Limoncello "Dulce, cítrico y fresco.", Mimosa "Naranja y espumante, para empezar.") y precio; promo "2 spritz × 50 mil · 2 copas × 30 mil"; botón "Ver carta completa". Grilla 1/2/4 columnas.
  - Día y tarde (`id="dia-y-tarde"`): título "De día café, de tarde aperitivo."; cuatro `<details name="oferta">` (el primero `open`): Café → `capuchino`, Para acompañar → `pasteleria`, Combos → `cafe-frio`, Para picar → `tabla-picar`; cada uno con 1–2 frases sacadas de la carta y su imagen. Usar `<details>` nativo (funciona sin JS).
  - Firma (`id="firma"`): fondo oliva; "CORAGGIO:" en Gloock naranja ≥ 64 px; "/co-rà-ggio/"; el párrafo etimológico del spec; remate "Coraggio no es solo valentía; en su raíz más antigua significa *vivir con el corazón por delante*." Texto de párrafo en crema (contraste ≥ 4,5:1 sobre oliva).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "Inicio: secciones 1 a 7"`.

---

### Task 6: Inicio — secciones 8 a 16 y barra móvil

**Files:**
- Modify: `index.html`, `css/inicio.css`, `js/main.js`, `tests/sitio.test.js`

**Interfaces:**
- Consumes: `estadoHorario` (Task 3); reseñas literales del spec §4.1.
- Produces: `<p id="estado-horario" class="estado" hidden>` que `main.js` completa y muestra; `<nav class="barra-movil">` con Carta · Cómo llegar · Pedir.

- [ ] **Step 1: Tests**:

```js
test('secciones 8-16 presentes en orden después de firma', () => {
  const ids = ['firma', 'resenas', 'cinta-animo', 'marca', 'momentos', 'historia', 'recetas', 'instagram', 'visitanos'];
  const pos = ids.map(id => inicio().indexOf(`id="${id}"`));
  assert.ok(pos.every(p => p > 0), pos.join());
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});
test('las cuatro reseñas reales, con 4,9 y 31 reseñas', () => {
  for (const n of ['Mariana Rodriguez', 'Ale', 'Dayana Guerrero', 'Guillermo Yepes']) assert.match(inicio(), new RegExp(n));
  assert.match(inicio(), /los mejores Aperol de Medallo/);
  assert.match(inicio(), /4,9/); assert.match(inicio(), /31 reseñas/);
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
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Marcado y estilos** según el spec:
  - Reseñas (`id="resenas"`): encabezado "4,9 en Google · 31 reseñas" con estrellas (texto alternativo "4,9 de 5 estrellas"); lista `<ul>` con scroll horizontal (`scroll-snap`) y botones anterior/siguiente que `main.js` conecta a `scrollBy`; sin JS la lista se puede desplazar igual. Enlace "Ver todas en Google".
  - Cinta (`id="cinta-animo"`): "¡Coraggio! · ¡Ánimo! · ¡Fuerza! · Ponle corazón que tú puedes".
  - Marca (`id="marca"`): "CORAGGIO" en Gloock a `clamp(4rem, 18vw, 16rem)` con una copa recortada de `aperol-spritz-960.jpg` superpuesta al centro mediante `clip-path`/máscara circular u ovalada; `aria-hidden` en lo decorativo y un `<h2 class="visualmente-oculto">Coraggio</h2>`.
  - Momentos (`id="momentos"`): `tazas-momentos` + lista de frases "Tuve un mal día", "Necesitaba una pausa", "Me dieron el trabajo", "Me animé y le escribí", "Hoy me celebro", "Brindamos por nosotras", "Me gradué", "Me voy a casar".
  - Historia (`id="historia"`): `salon` + texto propuesto (2 párrafos, para revisión del cliente) y botón "Ver la carta".
  - Recetas (`id="recetas"`): título "Así lo preparamos."; tres tarjetas con nombre, descriptor, origen (Aperol: "Nació en Padua. Aperol fue presentado en 1919 por los hermanos Barbieri."; Campari: "Una historia desde 1860. Gaspare Campari creó el licor que lleva su apellido."; Limoncello: "El secreto está en la cáscara: se elabora infusionando cáscaras de limón.") y receta.
  - Instagram (`id="instagram"`): título "Etiqueta a tu compañía de aperitivo."; 6 imágenes 960 (`campari-spritz`, `mimosas`, `capuchino`, `limoncello-spritz`, `pasteleria`, `salon`), cada una enlazada al perfil; botón "@co.ra.ggio".
  - Visítanos (`id="visitanos"`): dirección, horario escrito, `#estado-horario`, mapa embebido de Google Maps (`<iframe loading="lazy" title="Mapa de Coraggio Aperitivos">` con `https://www.google.com/maps?q=6.2346475,-75.5694637&z=17&output=embed`), botones Cómo llegar · WhatsApp · Pedir a domicilio, correo, teléfono, bloque de pedidos por encargo.
  - Pie: "CORAGGIO" grande, logo completo pequeño, enlaces, redes, notas legales literales, `© <span id="anio">2026</span> Coraggio Aperitivos`.
  - Barra móvil: visible < 768 px, fija abajo, tres botones ≥ 44 px; `body` con `padding-bottom` igual a su alto para no tapar el pie.
- [ ] **Step 4: `js/main.js`**: importa `estadoHorario`, completa `#estado-horario` con `` `${etiqueta} · ${detalle}` `` y quita `hidden`; agrega clase `estado--abierto`/`estado--cerrado` (el color acompaña, la palabra manda); conecta el carrusel; pone el año.
- [ ] **Step 5:** `npm test` → PASS.
- [ ] **Step 6: Commit** — `git commit -m "Inicio: secciones 8 a 16 y barra móvil"`.

---

### Task 7: Chequeos de calidad, SEO y metadatos

**Files:**
- Modify: `index.html`, `carta.html`, `tests/sitio.test.js`

**Interfaces:**
- Consumes: ambas páginas terminadas.

- [ ] **Step 1: Tests** (para ambas páginas):

```js
const paginas = ['index.html', 'carta.html'];
test('toda imagen tiene alt y no vacío salvo decorativas marcadas', () => {
  for (const p of paginas) for (const img of leer(p).match(/<img[^>]*>/g)) {
    assert.match(img, /alt="/, `${p}: ${img}`);
    if (!/aria-hidden="true"/.test(img)) assert.doesNotMatch(img, /alt=""/, `${p}: ${img}`);
  }
});
test('enlaces de solo ícono tienen aria-label', () => {
  for (const p of paginas) for (const a of leer(p).match(/<a [^>]*class="[^"]*icono[^"]*"[^>]*>/g) || []) assert.match(a, /aria-label="/, a);
});
test('externos con target _blank y rel noopener', () => {
  for (const p of paginas) for (const a of leer(p).match(/<a [^>]*href="https?:[^>]*>/g)) {
    assert.match(a, /target="_blank"/, a); assert.match(a, /rel="noopener"/, a);
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
    assert.match(h, /<html lang="es-CO">/); assert.match(h, /<meta name="description"/);
    assert.match(h, /<meta property="og:image" content="img\/tres-spritz-1920\.jpg"/);
    assert.match(h, /<link rel="icon" href="favicon\.svg"/);
  }
  const ld = JSON.parse(inicio().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld['@type'], 'BarOrPub');
  assert.equal(ld.address.addressLocality, 'Medellín');
  assert.equal(ld.telephone, '+57 300 700 2822');
  assert.deepEqual(ld.openingHoursSpecification.opens, '09:00');
  assert.deepEqual(ld.openingHoursSpecification.closes, '21:00');
});
test('sin dependencia de JS para contenido, sin localStorage, animaciones con reduced-motion', () => {
  assert.doesNotMatch(inicio(), /localStorage/);
  for (const f of ['css/base.css', 'css/inicio.css', 'css/carta.css']) {
    const css = leer(f);
    if (/@keyframes|animation:/.test(css) && f !== 'css/base.css') assert.match(css, /prefers-reduced-motion/, f);
    assert.doesNotMatch(css, /opacity:\s*0[^.]/, `${f}: nada debe arrancar invisible`);
  }
});
test('contenedores de imagen con color de fondo', () => {
  assert.match(leer('css/base.css'), /picture[^{]*\{[^}]*background(-color)?:/);
});
```

- [ ] **Step 2:** `npm test` → FAIL en lo que falte.
- [ ] **Step 3:** Completar en ambos HTML: `<title>`, `description`, Open Graph (`og:title`, `og:description`, `og:image` relativo, `og:locale` `es_CO`), favicon, y en `index.html` el JSON-LD `BarOrPub` con nombre, dirección (`streetAddress` "Cra. 43A #33-57, Local 167", `addressLocality` "Medellín", `addressRegion` "Antioquia", `addressCountry` "CO"), `geo`, `telephone`, `email`, `priceRange` "$20.000–40.000", `servesCuisine` "Italiana", `aggregateRating` 4.9/31, `sameAs` Instagram, `openingHoursSpecification` con `dayOfWeek` los 7 días, `opens` "09:00", `closes` "21:00"; `picture{background-color:var(--oliva)}` en base.css.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "Accesibilidad, SEO y datos estructurados"`.

---

### Task 8: Verificación en navegador

**Files:**
- Create: `.claude/launch.json` (servidor `python3 -m http.server 8080`)

- [ ] **Step 1:** Levantar el servidor con `preview_start` y abrir `index.html` y `carta.html`.
- [ ] **Step 2:** Revisar a 1440 px, 768 px, 375 px y 320 px de ancho: sin scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), menú, hero legible, grilla de copas, carta sin precios pisados, barra móvil visible solo < 768 px y sin tapar el pie.
- [ ] **Step 3:** Con zoom de texto 200 % (`document.documentElement.style.fontSize='200%'`) a 375 px: nada cortado.
- [ ] **Step 4:** Con `prefers-reduced-motion: reduce` emulado: cintas quietas, todo visible.
- [ ] **Step 5:** Con JavaScript deshabilitado (o quitando `js/main.js`): carta completa, horario escrito y enlaces visibles; `#estado-horario` oculto.
- [ ] **Step 6:** Navegación con teclado (Tab) por inicio: foco visible en cada enlace, botón y `<details>`.
- [ ] **Step 7:** Consola sin errores; todas las imágenes cargan (ningún 404 en red).
- [ ] **Step 8:** Medir contraste real de: texto del hero sobre la foto (≥ 4,5:1 en el punto más claro bajo el texto, o ≥ 3:1 si es ≥ 24 px), texto crema sobre oliva, botón naranja. Ajustar el degradado del hero si falla.
- [ ] **Step 9:** Corregir lo encontrado, `npm test`, commit `git commit -am "Ajustes de verificación en navegador"`.
- [ ] **Step 10:** Mostrar capturas de escritorio y celular al usuario. La publicación en Netlify/GitHub Pages requiere su cuenta: se le dan los pasos y lo hace él (o autoriza explícitamente hacerlo desde su navegador).
