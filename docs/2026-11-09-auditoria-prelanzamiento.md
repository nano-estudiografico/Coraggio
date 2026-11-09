# Auditoría pre-lanzamiento: coraggioaperitivos.com

Fecha: 9 de noviembre de 2026. Revisión del sitio (`index.html`, `en.html`, `carta.html`, `carta-en.html`) antes de publicarlo en su dominio. Cubre SEO técnico y de contenido, datos estructurados, GEO (visibilidad en buscadores con IA: Google AI Overviews, ChatGPT, Perplexity), rendimiento, seguridad y legal. El sitio aún no responde en el dominio, así que todo se revisó sobre los archivos del repositorio, la vista previa en GitHub Pages y un servidor local idéntico a Cloudflare Pages (`npm run dev`, que usa wrangler).

**Hosting: Cloudflare Pages.** Sirve URLs limpias (`/carta` en lugar de `carta.html`, y redirige con 308 la forma con extensión), lee `_headers` y `_redirects` de la raíz y sirve `404.html` en las rutas inexistentes.

## Resumen

**Estado: listo para publicar una vez hechos los pasos de lanzamiento de la sección 3.** Puntuación estimada de salud SEO: **90/100** (antes de los cambios de hoy: 61, sobre todo por URLs de la vista previa, falta de canonical y de sitemap).

Lo que ya estaba bien y conviene no romper:

- Títulos y descripciones únicos en las cuatro páginas, con ciudad y categoría («café y aperitivo italiano en Medellín»).
- Datos del negocio (nombre, dirección, teléfono, horario) idénticos en texto visible, pie y JSON-LD. Esa consistencia es lo que más pesa para búsqueda local y para que una IA cite el negocio.
- Contenido real y citable: precios en texto (no en imagen ni PDF), recetas con medidas, origen de cada spritz, reseñas literales de Google, horario con zona horaria correcta.
- Accesibilidad trabajada: `alt` en todas las imágenes, enlaces de ícono con `aria-label`, «saltar al contenido», contraste AA, respeto a «reducir movimiento», todo legible sin JS.
- Versión en inglés completa con `hreflang` recíproco.
- Externos con `rel="noopener"`; sin cookies, sin analítica, sin formularios; el HTML de la carta escapa lo que llega de Google Sheets (sin riesgo XSS).
- 35 tests automáticos que vigilan todo lo anterior.

## 1. Cambios aplicados hoy

| Área | Cambio | Archivos |
|---|---|---|
| URLs | Todas las referencias absolutas pasan de `nano-estudiografico.github.io/Coraggio/` a `https://coraggioaperitivos.com/`. | 4 páginas |
| Canonical | `<link rel="canonical">` en cada página. Evita que `/` y `/index.html`, o la vista previa de GitHub, cuenten como duplicados. | 4 páginas |
| hreflang | Se añade `x-default` (apunta a la versión en español). Antes solo había `es` y `en`. | 4 páginas |
| Open Graph | `og:url` en las dos cartas (faltaba), `og:type` y `og:site_name` en todas. | 4 páginas |
| Imagen OG | `img/thumbnail.png` (610 KB) pasa a `img/thumbnail.jpg` (84 KB), mismo 1200×630. WhatsApp e Instagram descartan vistas previas pesadas. | `img/` |
| JSON-LD | `@type` doble `CafeOrCoffeeShop` + `BarOrPub` (es ambas cosas y así lo describen los títulos); `url`, `@id`, `logo`, `hasMenu` hacia la carta, `currenciesAccepted`, `image` con URL absoluta (era relativa, inválida para Google), Maps en `sameAs`. | `index.html`, `en.html` |
| JSON-LD | Se **quita `aggregateRating`**. Las políticas de datos estructurados de Google no admiten valoraciones «autoservidas» en `LocalBusiness`: no generan estrellas en el resultado y pueden derivar en acción manual. El 4,9 y las 31 reseñas siguen en el texto visible, que es lo correcto. | `index.html`, `en.html` |
| robots.txt | Nuevo. Permite todo (también a rastreadores de IA) y declara el sitemap. | `robots.txt` |
| sitemap.xml | Nuevo, con las 4 URLs y sus alternativas de idioma. | `sitemap.xml` |
| 404 | Nueva página con la marca, enlaces a inicio y carta, `noindex`. GitHub Pages la sirve automáticamente. | `404.html` |
| URLs limpias | Enlaces internos, canonical, hreflang, `og:url`, sitemap y JSON-LD usan `/`, `/en`, `/carta` y `/carta-en`, que es como Cloudflare Pages las sirve. Así ningún clic pasa por una redirección. | 4 páginas, `sitemap.xml` |
| Cabeceras de seguridad | `_headers` con Content-Security-Policy (solo permite lo que el sitio usa: estilos propios y en línea, Google Fonts, el mapa de Google y la hoja de Google Sheets), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS con preload y `Cross-Origin-Opener-Policy`. Probado en el navegador: fuentes, mapa, video y carta viva funcionan sin bloqueos. | `_headers` |
| Caché | Un año e `immutable` para `css/`, `js/`, `img/` y `video/` (CSS y JS ya llevan `?v=`). | `_headers` |
| Redirección | `www.coraggioaperitivos.com` → `coraggioaperitivos.com` con 301. | `_redirects` |
| Servidor local | `npm run dev` levanta wrangler, que se comporta igual que Cloudflare Pages (URLs limpias, cabeceras, 404). Sustituye al `http.server` de Python, que no resolvía `/carta`. | `package.json`, `.claude/launch.json` |
| Tests | Actualizados al dominio nuevo y a URLs limpias, y un test nuevo que vigila canonical, hreflang, og:url, robots.txt, sitemap, 404, `_headers` y `_redirects`. | `tests/sitio.test.js` |

Se deja a propósito `<meta name="robots" content="noindex, nofollow">` en las 4 páginas: mientras el sitio solo exista en la vista previa de GitHub no debe indexarse. **Quitarlo es el paso 2 del lanzamiento.**

## 2. Hallazgos pendientes, por prioridad

### Alta (antes o el mismo día del lanzamiento)

- **Quitar `noindex`** (ver sección 3). Si queda, el sitio no aparecerá en Google aunque todo lo demás esté bien.
- **Google Business Profile**: poner `https://coraggioaperitivos.com` como sitio web y `https://coraggioaperitivos.com/carta` como enlace de menú. Es la señal más fuerte para búsqueda local y para que las IA relacionen la ficha con el sitio.
- **Search Console y Bing Webmaster**: verificar el dominio y enviar el sitemap. Bing alimenta a Copilot y a ChatGPT; no cuesta nada añadirlo.

### Media (primeras semanas)

- **Google Fonts** (tres familias) es la única petición externa que bloquea el primer pintado y envía la IP del visitante a Google. Autohospedar las fuentes en `fonts/` con `font-display: swap` mejora LCP y quita la dependencia. Colombia no exige banner de consentimiento para esto (no hay cookies), pero es buena práctica.
- **Video del hero** (2 MB, autoplay). En celular con datos es el mayor costo de la página. Opciones: una versión más chica para pantallas angostas (`<source media>`), o `preload="none"` y arrancarlo al cargar la página. El póster ya existe, así que el LCP no depende del video.
- **Schema de la carta.** `hasMenu` ya enlaza la carta; el siguiente nivel es generar en `carta-html.js` un JSON-LD `Menu` con `MenuSection`, `MenuItem` y `Offer` (precio en COP) a partir del mismo `data/carta.json`. Google y las IA leen los precios directamente. Pendiente porque tiene que convivir con la carta «viva» que se recarga desde Drive.
- **Preguntas frecuentes.** Para GEO lo que más falta es contenido que responda preguntas concretas que la gente le hace a una IA: ¿se puede trabajar con el portátil? (las reseñas lo dicen), ¿hay wifi?, ¿reservan?, ¿aceptan mascotas?, ¿dónde se parquea en Plazuelas de San Diego?, ¿hacen tortas por encargo? Un bloque de 5 o 6 preguntas en «Visítanos» con schema `FAQPage` sirve a ambos. Las respuestas las tiene que confirmar el negocio.

### Baja (cuando se pueda)

- **`llms.txt`.** Archivo opcional que algunos rastreadores de IA leen. Google lo ignora. Si se hace, es un resumen de 10 líneas con nombre, qué es, dirección, horario, enlaces a carta, Instagram y Rappi.
- **H1 del inicio** («Ponle corazón.») es de marca, no descriptivo. Está bien así porque el `<title>`, la descripción y los H2 llevan las palabras clave. No tocar.
- **Repositorio público.** Expone `CartaCORAGGIO.pdf`, `docs/` (incluye este informe y el documento de diseño con la lista de reseñas) y `grabaciones/`. No hay secretos, claves ni tokens (revisado). Si el PDF de la carta queda viejo, conviene borrarlo del repo: el botón «Descargar carta en PDF» ya apunta a Drive.
- **Hoja de Google Sheets.** La carta se recarga desde una hoja pública en modo lectura. Quien tenga permiso de **edición** en esa hoja cambia los precios del sitio al instante: mantener ese permiso en una o dos personas. El texto se escapa, así que no se puede inyectar código, solo contenido.

## 3. Pasos de lanzamiento, en orden

1. **Proyecto en Cloudflare Pages.** Workers & Pages → Create → Pages → conectar el repositorio `nano-estudiografico/Coraggio`, rama `main`. Framework preset: None. Build command: vacío. Build output directory: `/` (la raíz). Cada push a `main` publica solo. Comprobar primero en la URL `*.pages.dev` que salen las 4 páginas, `/robots.txt`, `/sitemap.xml`, una ruta inexistente (404 con marca) y que la carta recarga desde la hoja.
2. **Dominio.** Si el dominio está en Cloudflare (recomendado: así la zona DNS, el certificado y el proxy quedan en un solo sitio), en el proyecto → Custom domains → añadir `coraggioaperitivos.com` y también `www.coraggioaperitivos.com`; Cloudflare crea los registros solos. Si el DNS está en otro registrador, Cloudflare indica el `CNAME` a poner. El `_redirects` ya manda `www` al dominio sin `www`. En SSL/TLS dejar «Full (strict)» y activar «Always Use HTTPS».
3. **Quitar `noindex`** en las cuatro páginas y commitear:
   ```sh
   sed -i '' '/<meta name="robots" content="noindex, nofollow">/d' index.html en.html carta.html carta-en.html
   npm test && git commit -am "feat: el sitio pasa a indexable al publicarse en coraggioaperitivos.com" && git push
   ```
4. **Apagar GitHub Pages** en el repositorio (Settings → Pages → Source: None) para que la vista previa `nano-estudiografico.github.io/Coraggio` deje de existir y no compita con el dominio. Las canonical ya apuntan al dominio, así que no es urgente, pero es más limpio.
5. **Comprobar en el dominio** con `curl -I https://coraggioaperitivos.com/`: debe salir la cabecera `content-security-policy` y las demás de `_headers`. Abrir las 4 páginas con la consola del navegador: cero mensajes «Refused to…».
6. **Validar**: Rich Results Test de Google con la URL de inicio; vista previa de Open Graph (opengraph.xyz o el depurador de Facebook); PageSpeed Insights en celular; securityheaders.com (debería dar A).
7. **Search Console**: propiedad de tipo «Dominio» (registro TXT; si el DNS está en Cloudflare se añade ahí), enviar `sitemap.xml`, pedir indexación de las 4 URLs. **Bing Webmaster Tools**: importar desde Search Console.
8. **Google Business Profile**: sitio web `https://coraggioaperitivos.com` y enlace de menú `https://coraggioaperitivos.com/carta`. **Instagram**: enlace de la bio al dominio. **Rappi**: si la ficha admite sitio web, ponerlo.
9. **Al cabo de una semana**: revisar en Search Console cobertura y errores de hreflang; buscar «Coraggio Aperitivos» en Google, ChatGPT y Perplexity y ver qué responden y qué citan.

Nota sobre la CSP: si más adelante se añade algo externo (analítica, otro embed, una fuente nueva), hay que sumarlo a `_headers` o el navegador lo bloquea. La consola del navegador dice exactamente qué directiva lo bloqueó.

## 4. Puntuación por categoría

| Categoría | Peso | Nota | Comentario |
|---|---|---|---|
| SEO técnico | 22 % | 98 | Canonical, hreflang, sitemap, robots, 404, URLs limpias y cabeceras de seguridad listos. |
| Contenido | 23 % | 85 | Real, propio y citable. Falta un bloque de preguntas frecuentes. |
| On-page | 20 % | 95 | Títulos, descripciones y encabezados correctos. URLs limpias. |
| Datos estructurados | 10 % | 80 | Negocio completo. Falta `Menu` detallado en la carta. |
| Rendimiento | 10 % | 75 | Video de 2 MB en el hero y fuentes externas. Imágenes bien (WebP, lazy, dimensiones). |
| Preparación para IA (GEO) | 10 % | 85 | Rastreadores permitidos, entidad consistente, datos en texto. Falta FAQ. |
| Imágenes | 5 % | 95 | Todas con `alt`, ninguna foto sobre 600 KB (test). |
