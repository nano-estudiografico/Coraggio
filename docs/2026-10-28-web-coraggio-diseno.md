# Web de Coraggio Aperitivos — Documento de diseño

Fecha: 28 de octubre de 2026
Estado: borrador para aprobación

## 1. Intención

Coraggio es un café y aperitivo de estilo italiano en el C.C. Plazuelas de San Diego (local 167), Colombia. De día sirve café de especialidad y pastelería; de tarde, spritz, copas, cerveza y algo para picar. La web tiene que hacer cuatro cosas, en este orden de importancia:

1. Mostrar de qué se trata el lugar (el ambiente y el espíritu "Coraggio").
2. Contar su oferta (spritz, café, pastelería, para picar).
3. Dejar ver la carta completa con precios.
4. Explicar cómo llegar y cómo contactarlos o pedir.

El nombre es el corazón de la marca: *coraggio* viene del latín *cor* (corazón); en italiano es lo que se dice para dar ánimo. "Vivir con el corazón por delante" es la idea que la distingue de cualquier otra cafetería.

## 2. Objetivos, no-objetivos y anti-objetivos

**Objetivos**
- Una persona que llega desde Instagram, Google o el Linktree entiende en segundos qué es Coraggio y encuentra la carta, la ubicación y el WhatsApp sin buscar.
- La carta se lee cómoda en el celular y se puede actualizar cambiando un archivo de datos, sin tocar el diseño.
- La web se siente de la misma familia que el Instagram de la marca.

**No-objetivos**
- No hay tienda online, carrito, cuentas de usuario ni reservas en línea.
- No hay newsletter ni formulario de suscripción.
- No hay panel de administración ni base de datos.

**Anti-objetivos (sería un fracaso aunque funcione)**
- Que parezca una plantilla genérica de cafetería.
- Que la carta sea solo un PDF o una imagen ilegible en el celular.
- Que haya que hacer scroll largo para encontrar dirección, horario o WhatsApp.
- Mostrar reseñas, testimonios o datos inventados.

## 3. Referencia de estructura

El usuario pidió una estructura parecida a vibebevvy.com: una sola página larga que alterna momentos de impacto (tipografía gigante, fotos a todo el ancho, cintas animadas) con bloques de información. Se toma la estructura y el ritmo, no su estética (colores, ilustraciones, tipografía) ni sus elementos de tienda.

## 4. Datos del negocio (confirmados)

| Dato | Valor |
|---|---|
| Nombre | Coraggio Aperitivos ("Café ~ Aperitivos") |
| Dirección | Cra. 43 # 33-57, Local 167 (C.C. Plazuelas de San Diego), La Candelaria, Medellín, Antioquia, Colombia |
| Coordenadas | 6.2346475, -75.5694637 (Plus Code 6CMJ+V6 Medellín) |
| Google | 4,9 estrellas, 31 reseñas · Bar · $20.000–40.000 por persona — https://www.google.com/maps/place/Coraggio+Aperitivos/@6.2346475,-75.5694637,17z/data=!4m6!3m5!1s0x8e442976cf9ba0d1:0xa5ca79516951902a |
| Horario | Todos los días, 9:00 a 21:00 |
| WhatsApp | 300 700 2822 — enlace: https://wa.me/message/XNE77YPUTSUAP1 |
| Correo | coraggioaperitivos@gmail.com |
| Instagram | @co.ra.ggio — https://www.instagram.com/co.ra.ggio |
| Google Maps | https://maps.app.goo.gl/ZUkwQF5rzuo5nZUx7 |
| Rappi | https://www.rappi.com.co/restaurantes/delivery/373002-coraggio-aperitivos |
| Carta en PDF | https://drive.google.com/file/d/1NCRkEysY1rXxLWQ3CeQs1u3g243O7F9w/view |
| Pedidos por encargo | Pan de masa madre, tortas y desayunos empresariales (por WhatsApp) |
| Aviso legal obligatorio | "El exceso de alcohol es perjudicial para la salud. Prohíbase el expendio de bebidas embriagantes a menores de edad." |
| Nota de precios | "Precios en miles de pesos. Incluyen impuesto al consumo." |

### 4.1 Reseñas seleccionadas (Google Maps, 28 oct 2026)

Elegidas por cubrir los tres argumentos del lugar: ambiente, aperitivo y café para trabajar. Todas de 5 estrellas.

- **Mariana Rodriguez**: "Es un lugar super acogedor, original, y único con un ambiente italiano, y sus cocteles ni hablar🤌🏻, este lugar para tardear definitivamente 5⭐️🤩, tienen que venir!!!"
- **Ale**: "Que lugar tan buena vibra! Me encantó porque tienen un espacio adentro que permite teletrabajar mientras te tomas un muy buen café. El servicio fue increíble! Vale volver!"
- **Dayana Guerrero**: "Probé una torta deliciosa 😍 y quedé fascinada con las mimosas. Un ambiente súper agradable, música chévere y una atención excelente. Me encantó."
- **Guillermo Yepes**: "Ambiente tranquilo y los mejores Aperol de Medallo"

La carta completa está en `CartaCORAGGIO.pdf` (en la raíz del proyecto) y es la fuente de verdad de productos y precios.

## 5. Estructura de la página de inicio

Una sola página con anclas. El orden:

| # | Sección | Contenido | Notas |
|---|---|---|---|
| 1 | Cinta superior | Spritz · Café de especialidad · Mimosas · Pastelería · Aperitivo italiano | Texto en movimiento lento; se detiene con "reducir movimiento". |
| 2 | Menú | Izquierda: Inicio · Carta · Visítanos. Centro: logo. Derecha: íconos de WhatsApp e Instagram. | Fijo arriba al hacer scroll. En celular, menú compacto. |
| 3 | Inicio (hero) | Foto `tres-spritz.jpg` a todo el ancho; encima una frase grande en la tipografía display; botones **Ver la carta** y **Pedir a domicilio** (Rappi). | La frase exacta queda a decisión del constructor dentro del tono de marca (ej. "Ponle corazón."). |
| 4 | Frase | "No todos los spritz saben a lo mismo." | Frase de la propia marca. |
| 5 | Grilla de copas | 4 tarjetas: Aperol, Campari y Limoncello Spritz y Mimosa, con foto, descripción y precio. Debajo, la promo **2 spritz × 50 mil · 2 copas × 30 mil** y el botón **Ver carta completa**. | Descripciones de la marca: Aperol "Cítrico y agridulce", Campari "Amargo y con carácter", Limoncello "Dulce, cítrico y fresco". Mimosa: a criterio del constructor. |
| 6 | Foto + desplegable | Título "De día café, de tarde aperitivo." Foto a un lado; al otro, cuatro apartados desplegables: Café · Para acompañar · Combos · Para picar, cada uno con un texto corto y su foto (`capuchino`, `pasteleria`, `cafe-frio`, `tabla-picar`). | Uno abierto por defecto. |
| 7 | Momento firma | Fondo verde oliva. **CORAGGIO:** /co-rà-ggio/ y la definición etimológica; remata con "vivir con el corazón por delante". | Es el elemento que define la página; el resto queda más tranquilo. |
| 8 | Reseñas | "4,9 en Google · 31 reseñas" y un carrusel con reseñas reales seleccionadas (ver sección 4.1), con nombre tal como figura en Google, estrellas y enlace "Ver todas en Google". | Textos literales, sin editar salvo cortar con "…". Si el negocio prefiere, se usan solo iniciales del nombre. |
| 9 | Cinta | "¡Coraggio! · ¡Ánimo! · ¡Fuerza! · Ponle corazón que tú puedes" | |
| 10 | Marca gigante | "CORAGGIO" en tipografía enorme con una copa de spritz recortada en el medio. | Recorte de `aperol-spritz.jpg` o equivalente. |
| 11 | Momentos | Foto `tazas-momentos.jpg` con frases de ocasiones: "Tuve un mal día", "Me gradué", "Hoy me celebro", "Necesitaba una pausa"… | Las frases vienen de la publicación de Instagram de la marca. |
| 12 | Historia | Foto `salon.jpg`, texto corto sobre el lugar y el nombre. | El texto de la historia lo propone el constructor con lo que se sabe; el usuario lo revisa. |
| 13 | Así lo preparamos | Tres tarjetas con la receta de cada spritz: 90 ml de prosecco, 60 ml del licor (Aperol, Campari o limoncello), 30 ml de soda, hielo y rodaja de naranja o limón. Incluye el dato de origen (Aperol: Padua, 1919, hermanos Barbieri; Campari: Gaspare Campari, 1860). | Contenido de las publicaciones de la marca. |
| 14 | Instagram | "Etiqueta a tu compañía de aperitivo." Galería de imágenes y botón a @co.ra.ggio. | Sin integración con la API de Instagram: imágenes del proyecto con enlace al perfil. |
| 15 | Visítanos | Dirección, horario con indicador "Abierto ahora / Cerrado" (calculado con la hora de Colombia, siempre con el horario escrito al lado), mapa, botones **Cómo llegar** (Maps), **WhatsApp**, **Pedir a domicilio** (Rappi), correo. Bloque de pedidos por encargo. | |
| 16 | Pie | "CORAGGIO" grande, enlaces, redes, nota de precios y aviso legal sobre el alcohol. | |

**Celular:** barra fija abajo con tres acciones: **Carta · Cómo llegar · Pedir**.

## 6. Página de la carta

Página propia (`/carta`), organizada como el PDF, legible y con precios en texto real:

- **Café**: Bebidas calientes · Bebidas frías (incluye Chai latte) · Combos (Classico, Due, Freddo, Dolce, con su contenido) · Para acompañar: Dulce y Salado (Pastel Il Rustico con su descripción "salami, pepperoni y queso crema").
- **Aperitivos**: Spritz y copas · Birras (incluye vaso michelado) · Sin alcohol · Para picar (Crostinis x12).
- Promos: 2 spritz × 50 · 2 copas × 30.
- Nota de precios, aviso legal y bloque de pedidos por encargo.
- Navegación rápida entre categorías (índice pegajoso o pestañas).
- Enlace secundario "Descargar carta en PDF".

Los datos de la carta viven en un archivo aparte (JSON o similar) para cambiar precios sin tocar el diseño.

## 7. Identidad visual

**Color** (valores tomados de capturas; aproximados, a confirmar con el archivo de marca si existe):

| Rol | Valor aproximado | Uso |
|---|---|---|
| Verde oliva | #303717 | Texto principal sobre fondos claros, fondo del momento firma y del pie |
| Naranja Coraggio | #FF5E00 (oficial, confirmado por el usuario el 28 oct 2026) | Botones de acción principal, títulos grandes sobre oliva y logo; nunca texto chico ni contorno de foco sobre crema |
| Crema | ~#F4EEE3 | Fondo general |
| Blanco / mármol | — | Tarjetas, carta |

Contraste medido con esos valores:
- Naranja sobre verde oliva: 4,07:1 → solo títulos grandes o negrita (mínimo 3:1), no texto común.
- Naranja sobre crema: 2,65:1 → no se usa para texto.
- Verde oliva sobre crema: 10,8:1 → texto general.
- Botones naranjas: texto en verde oliva y en negrita.

**Tipografía**
- Display: una serif con carácter, cercana a la del logo y las publicaciones. Solo en títulos, frases y momentos grandes.
- Texto y carta: una sans muy legible, mínimo 17 px, que crece si la persona agranda el texto.
- Fuentes de Google Fonts o Adobe Fonts; la elección exacta queda al constructor.

**Logo**: no existe en vector; hay que construirlo como parte del trabajo. Se redibuja en SVG a partir de la captura `Captura de pantalla 2026-10-28 a la(s) 15.16.10.png`: el círculo naranja con la "C" ornamental, la palabra CORAGGIO en la serif de la marca y "~ APERITIVOS ~" espaciado debajo. Se entregan tres versiones: completa, horizontal (círculo + palabra, para el menú) y solo el círculo (ícono del navegador). El usuario aprueba el logo antes de usarlo. Aparece solo en el menú y en el pie.

**Imágenes**: carpeta `imagenes/`, generadas con Gemini con un tratamiento común (luz dorada de tarde, mármol blanco, banqueta capitoné coñac, pared crema con molduras, sin texto). Se optimizan para web (WebP o JPEG, máximo ~1920 px de ancho, con versiones más chicas para celular). `prueba-aperol-spritz.jpg` no se usa.

## 8. Accesibilidad y comportamiento

- Contrastes según la sección 7; texto mínimo 17 px; todo funciona con el texto agrandado al 200 %.
- Botones y enlaces de al menos 44 × 44 px en celular.
- Cintas y animaciones de entrada se apagan con "reducir movimiento"; ningún texto depende de una animación para leerse.
- Íconos sin texto (WhatsApp, Instagram) con nombre accesible.
- Estado "Abierto/Cerrado" nunca solo por color: siempre con palabra y horario.
- Fotos con texto alternativo descriptivo.
- Navegable con teclado y foco visible.

## 9. Técnica

- Sitio estático: HTML, CSS y JavaScript liviano, sin framework pesado, sin base de datos.
- La carta en un archivo de datos separado.
- Publicación en un hosting estático gratuito (Netlify, GitHub Pages o similar) con su dirección de prueba gratuita. No se compra dominio hasta que el cliente apruebe la web; el sitio no debe depender de un dominio fijo (rutas relativas).
- Metadatos para compartir (título, descripción, imagen) y datos estructurados de negocio local (dirección, horario, teléfono) para Google.

## 10. Decisiones tomadas por Claude (revisables)

- Una sola página de inicio más una página de carta, en lugar de varias páginas.
- La barra fija del celular con tres acciones (Carta · Cómo llegar · Pedir).
- La selección de las cuatro reseñas de la sección 4.1.
- El texto de "Historia" y la frase del inicio los redacta el constructor en el tono de la marca, para revisión.
- La galería de Instagram usa imágenes del proyecto, sin conexión en vivo con Instagram.
- Tipografías concretas y hosting quedan a elección del constructor dentro de lo descrito.

## 11. Pendientes

Resueltos el 28 de octubre: reseñas (sección 4.1), ciudad y dirección completa (sección 4), dominio (no hasta la aprobación del cliente) y logo (se construye, sección 7).

Queda para la revisión del cliente: la frase del inicio, el texto de "Historia" y el logo redibujado.
