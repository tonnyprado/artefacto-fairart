import { color } from '../../tema';

export function FormulaPrecio() {
  const chip = (t, fondo = '#fff', tinta = '#000', borde = true) => (
    <span style={{ background: fondo, color: tinta, border: borde ? '1px solid rgba(0,0,0,0.15)' : 'none', borderRadius: 6, padding: '6px 10px', fontWeight: fondo === '#fff' ? 400 : 700 }}>{t}</span>
  );
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14, fontSize: 12.5 }}>
      {chip('Tu ganancia')}<span>+</span>{chip('Comisión 25%')}<span>+</span>{chip('Ajuste a cifra cerrada')}<span>=</span>
      {chip('Precio de venta', color.rojo, color.crema, false)}<span>+ IVA 16% + tarjeta 3% =</span>
      {chip('Precio público', '#000', color.crema, false)}
    </div>
  );
}
