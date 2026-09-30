import { color, degradadoMarca } from '../../tema';

export function Encabezado() {
  return (
    <header style={{ background: degradadoMarca, padding: '14px 20px', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.04em', fontSize: 20, color: color.crema }}>
        Arte Facto
      </div>
      <div style={{ fontSize: 12, color: '#fff', mixBlendMode: 'overlay', fontWeight: 600, letterSpacing: '-0.02em' }}>
        Acuerdo de consignación · Segunda Edición · Estación Indianilla · 4–7 feb 2027
      </div>
    </header>
  );
}
