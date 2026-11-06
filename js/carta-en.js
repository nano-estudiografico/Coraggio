// Traducción al inglés de la carta (carta-en.html). Lo que no esté aquí queda tal cual viene de la hoja:
// si agregan un producto nuevo en Drive, sumen su traducción a esta lista.
const EN = {
  // Secciones y grupos
  'Café': 'Coffee', 'Bebidas calientes': 'Hot drinks', 'Bebidas frías': 'Cold drinks', 'Combos': 'Combos',
  'Para acompañar: dulce': 'On the side: sweet', 'Para acompañar: salado': 'On the side: savory',
  'Aperitivos': 'Aperitivo', 'Spritz y copas': 'Spritz & glasses', 'Birras': 'Beers',
  'Sin alcohol': 'Alcohol-free', 'Para picar': 'To share',
  // Café
  'Tinto': 'Tinto (black coffee)', 'Café con leche': 'Coffee with milk', 'Prensa francesa': 'French press',
  'Aromática': 'Herbal tea', 'Cold brew naranja': 'Orange cold brew', 'Limonada de café': 'Coffee lemonade',
  'Granizado de café': 'Coffee granita', 'Caliente o frío': 'Hot or iced',
  'Tinto + palito de queso': 'Tinto + cheese stick',
  'Latte o café con leche + pastel salado': 'Latte or coffee with milk + savory pastry',
  'Granizado de café o cold brew + pastel salado': 'Coffee granita or cold brew + savory pastry',
  'Cappuccino o americano + torta de zanahoria': 'Cappuccino or americano + carrot cake',
  // Pastelería
  'Torta de zanahoria': 'Carrot cake', 'Tarta vasca': 'Basque cheesecake',
  'Pastel de arequipe': 'Dulce de leche pastry', 'Pastel de guayaba': 'Guava pastry',
  'Palito de queso': 'Cheese stick', 'Pastel de jamón y queso': 'Ham & cheese pastry',
  'Pastel de tocineta': 'Bacon pastry', 'Pastel de pollo': 'Chicken pastry', 'Pastel de carne': 'Beef pastry',
  'Pastel Il Rustico': 'Il Rustico pastry', 'Salami, pepperoni y queso crema': 'Salami, pepperoni & cream cheese',
  // Aperitivos
  'Copa': 'Glass', 'Vino tinto': 'Red wine', 'Vino blanco': 'White wine', 'Vaso michelado': 'Michelada glass',
  'Con o sin azúcar': 'Regular or zero sugar', 'Agua': 'Water', 'Con o sin gas': 'Still or sparkling',
  'Té Hatsu': 'Hatsu tea',
  'Panini pulled pork': 'Pulled pork panini', 'Crostinis pulled pork': 'Pulled pork crostini',
  'Tabla madurados-queso': 'Cured meats & cheese board',
  // Promos
  '2 spritz × $50k': '2 spritz for $50k', '2 copas × $30k': '2 glasses for $30k',
};

export const traducirEn = (s) => EN[s] ?? s;
