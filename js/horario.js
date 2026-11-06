// Coraggio abre todos los días de 9:00 a 21:00, hora de Medellín.
const ABRE = 9 * 60;
const CIERRA = 21 * 60;

const horaBogota = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Bogota',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

export function estadoHorario(fecha, idioma = 'es') {
  const partes = Object.fromEntries(horaBogota.formatToParts(fecha).map((p) => [p.type, p.value]));
  const minutos = Number(partes.hour) * 60 + Number(partes.minute);
  const abierto = minutos >= ABRE && minutos < CIERRA;
  if (idioma === 'en') return abierto
    ? { abierto, etiqueta: 'Open now', detalle: 'Closes at 9:00 p.m.' }
    : { abierto, etiqueta: 'Closed', detalle: 'Opens at 9:00 a.m.' };
  return abierto
    ? { abierto, etiqueta: 'Abierto ahora', detalle: 'Cierra a las 9:00 p. m.' }
    : { abierto, etiqueta: 'Cerrado', detalle: 'Abre a las 9:00 a. m.' };
}
