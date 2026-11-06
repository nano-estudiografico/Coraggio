import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoHorario } from '../js/horario.js';

// Hora local de Bogotá (UTC−5 todo el año) expresada en UTC.
const bog = (h, m = 0) => new Date(Date.UTC(2026, 9, 28, h + 5, m));

test('8:59 cerrado', () => assert.equal(estadoHorario(bog(8, 59)).abierto, false));
test('9:00 abierto', () => assert.deepEqual(estadoHorario(bog(9)), { abierto: true, etiqueta: 'Abierto ahora', detalle: 'Cierra a las 9:00 p. m.' }));
test('20:59 abierto', () => assert.equal(estadoHorario(bog(20, 59)).abierto, true));
test('21:00 cerrado', () => assert.deepEqual(estadoHorario(bog(21)), { abierto: false, etiqueta: 'Cerrado', detalle: 'Abre a las 9:00 a. m.' }));
test('usa la hora de Bogotá aunque sea otro día en UTC', () => assert.equal(estadoHorario(new Date(Date.UTC(2026, 9, 29, 1, 30))).abierto, true)); // 20:30 en Bogotá
test('en inglés', () => {
  assert.deepEqual(estadoHorario(bog(9), 'en'), { abierto: true, etiqueta: 'Open now', detalle: 'Closes at 9:00 p.m.' });
  assert.deepEqual(estadoHorario(bog(21), 'en'), { abierto: false, etiqueta: 'Closed', detalle: 'Opens at 9:00 a.m.' });
});
