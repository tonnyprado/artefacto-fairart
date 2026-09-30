import { describe, it, expect } from 'vitest';
import { consignaReducer, estadoInicial, puedeAvanzar } from './consignaReducer';

const ctx = {
  artista: {}, datosPago: {}, contacto: {}, versionAcuerdo: 'x',
  obras: [{ id: 'o1', titulo: 'Umbral', tecnica: '', medida: '', gananciaRegistrada: 12000 }],
  borrador: null, enviado: null,
};

describe('consignaReducer', () => {
  it('permite regresar a cualquier paso ya visitado', () => {
    let s = estadoInicial(ctx);
    s = consignaReducer(s, { tipo: 'IR_A', paso: 12 });
    s = consignaReducer(s, { tipo: 'IR_A', paso: 3 });
    expect(s.paso).toBe(3);
    expect(s.maxPaso).toBe(12);
  });
  it('fiscal "cargada" exige archivo', () => {
    let s = consignaReducer(estadoInicial(ctx), { tipo: 'IR_A', paso: 9 });
    s = consignaReducer(s, { tipo: 'FISCAL', valor: 'cargada' });
    expect(puedeAvanzar(s)).toBe(false);
    s = consignaReducer(s, { tipo: 'CONSTANCIA', valor: { key: 'k', nombre: 'csf.pdf' } });
    expect(puedeAvanzar(s)).toBe(true);
  });
  it('paso 10 exige elegir descuento', () => {
    const s = consignaReducer(estadoInicial(ctx), { tipo: 'IR_A', paso: 10 });
    expect(puedeAvanzar(s)).toBe(false);
    expect(puedeAvanzar(consignaReducer(s, { tipo: 'DESCUENTO', valor: 10 }))).toBe(true);
  });
});
