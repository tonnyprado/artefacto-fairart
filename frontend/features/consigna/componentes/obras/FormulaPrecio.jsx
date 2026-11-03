import { color } from '../../tema';

export function FormulaPrecio() {
  const chip = (t, fondo = '#fff', tinta = '#000', borde = true) => (
    <span style={{ background: fondo, color: tinta, border: borde ? '1px solid rgba(0,0,0,0.15)' : 'none', borderRadius: 6, padding: '6px 10px', fontWeight: fondo === '#fff' ? 400 : 700 }}>{t}</span>
  );
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14, fontSize: 12.5 }}>
      {chip('Ingreso del artista · 75%')}<span>+</span>{chip('Comisión ARTE FACTO · 25%')}<span>=</span>
      {chip('Precio base', color.rojo, color.crema, false)}<span>+</span>{chip('Gestión administrativa · 4%')}<span>=</span>
      {chip('Subtotal')}<span>+</span>{chip('IVA · 16%')}<span>=</span>
      {chip('Precio público', '#000', color.crema, false)}
    </div>
  );
}
