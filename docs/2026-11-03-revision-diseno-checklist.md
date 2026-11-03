# Revisión de diseño y accesibilidad: checklist

Sitio de Coraggio Aperitivos (`index.html`, `carta.html`). Revisión del 3 de noviembre de 2026 según las Human Interface Guidelines de Apple, aplicadas como principios para web, y los umbrales de contraste WCAG AA (4,5:1 para texto de hasta 17 px, 3:1 para texto de 18 px o más y para indicadores de foco).

Contrastes calculados con los valores de `css/tokens.css`.

## Críticos: contraste

- [x] **Botón principal** («Ver la carta»): el texto oliva sobre naranja daba 4,07:1. Ahora usa `--oliva-profunda` (`#1e220e`): 5,31:1 en reposo y 6,26:1 con hover. `css/base.css` › `.btn--primario`
- [x] **Cintas en movimiento**: el mismo par a 12 px, 4,07:1. Ahora con `--oliva-profunda`: 5,31:1. `css/base.css` › `.cinta`
- [x] **Página actual en el menú de celular**: naranja sobre crema, 2,65:1 a 36 px. Ahora usa `--naranja-texto` (`#a83c00`): 5,49:1 sobre crema y al menos 3,67:1 cuando el menú translúcido queda encima del hero. `css/base.css` › `.menu__enlaces a[aria-current="page"]`
- [x] **Foco en «De día café…»**: el contorno naranja sobre crema oscura daba 2,36:1. Ahora es oliva: 9,6:1. `css/inicio.css` › `.dia details:has(summary:focus-visible)`
- [x] **Títulos del pie** («Visítanos», «Contacto»): naranja sobre oliva a 15 px, 4,07:1. Ahora en crema: 10,8:1. En la escena café siguen en oliva. `css/base.css` › `.pie` › `--pie-titulo`

## Movimiento

- [x] **Video del hero con «reducir movimiento»**: seguía en bucle. Ahora se pausa y queda el póster. `js/main.js`
- [x] **Velo de olas en «CORAGGIO»**: tapaba el texto hasta que la sección se veía en un 60 %. Ahora arranca al 30 %; la animación sigue durando 1,45 s. `js/main.js` › bloque `firma`
- [ ] **Cantidad de momentos animados** (unos diez): dejar las tarjetas de copas como elemento firma y calmar dos efectos de entrada, las letras de «De día café…» y la barra con oleaje de la frase.

## Marca

- [ ] **Sección «marca»**: unas 2,5 pantallas de scroll que solo muestran la marca. Acortarla a la mitad o quitarla.
- [ ] **El logo se repite** en menú, hero, separadores de las cintas, promos, «marca», «CORAGGIO:» y pie. Elegir dónde es esencial.

## Textos

- [x] **Un nombre por acción**: los botones y el pie dicen «Pedir a domicilio» y «Ver la carta». El menú sigue con «Pedir» y «Carta», que son etiquetas cortas de navegación: con «Pedir a domicilio» el menú de escritorio no cabe a 768 px.
- [x] **Cappuccino**: unificado como «cappuccino» en la hoja de Drive (celdas C6 y E19), en `data/carta.json`, en `carta.html` y en `index.html` (texto y alt). Los archivos `img/dia-capuchino-*` conservan su nombre.

## Para mantener

Lo que ya cumple y conviene no romper en próximos cambios:

- Texto base de 17 px; legales a 13 px como mínimo.
- Áreas táctiles de 44 px en botones, menú, flechas de reseñas y enlaces del pie.
- Enlace «Saltar al contenido».
- Respuesta a «reducir movimiento» en todas las animaciones, en CSS y en JS.
- El estado «Abierto / Cerrado» se lee como texto, no solo por el color del punto.
- El menú de celular se cierra con Escape y devuelve el foco al botón.
- Sin JS, todo queda en su estado final.
- Nunca naranja como texto sobre crema: para eso está `--naranja-texto`.
