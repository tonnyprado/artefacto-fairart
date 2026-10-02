import { useState } from 'react';
import { desglosar, gananciaDesdePublico, formatoMXN } from '../../shared/precios';
import { color } from '../../tema';

/**
 * Versión móvil de FilaObra (misma lógica, layout en tarjeta). Inputs a 16px para evitar zoom en iOS.
 * @param {Object} props
 * @param {any} props.obra
 * @param {number} props.ganancia
 * @param {(g: number) => void} props.onGanancia
 */
export function TarjetaObra({ obra, ganancia, onGanancia }) {
  const d = desglosar(ganancia);
  const [borrador, setBorrador] = useState(null);
  const aplicar = () => {
    if (borrador !== null) {
      const valorNumerico = parseFloat(borrador);
      if (!isNaN(valorNumerico) && valorNumerico >= 0) {
        onGanancia(gananciaDesdePublico(valorNumerico));
      }
      setBorrador(null);
    }
  };
  const modificada = Math.round(ganancia) !== obra.gananciaRegistrada;
  const input = { width: 130, textAlign: 'right', padding: '10px 12px', borderRadius: 8, fontSize: 16, background: '#fff', boxSizing: 'border-box' };
  const fila = (k, v, fuerte = false) => (<>
    <span style={{ fontSize: fuerte ? 13 : 12.5, fontWeight: fuerte ? 800 : 400, color: fuerte ? color.rojoOscuro : 'rgba(0,0,0,0.62)' }}>{k}</span>
    <span style={{ fontSize: fuerte ? 14 : 13.5, fontWeight: fuerte ? 800 : 400, color: fuerte ? color.rojoOscuro : undefined, textAlign: 'right' }}>{v}</span>
  </>);
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px' }}>
        <b style={{ fontSize: 15 }}>{obra.titulo}</b>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 2 }}>{obra.tecnica} · {obra.medida}</div>
        {modificada && <span style={{ display: 'inline-block', marginTop: 6, background: color.rojo, color: color.crema, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4 }}>Ajustada · antes {formatoMXN(obra.gananciaRegistrada)}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 12px', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: color.rojo }}>Tu ganancia</label>
        <input type="number" inputMode="numeric" min={0} step={100} value={Math.round(ganancia)} aria-label={`Ganancia ${obra.titulo}`}
          onChange={e => {
            const valor = parseFloat(e.target.value);
            onGanancia(!isNaN(valor) && valor >= 0 ? valor : 0);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.target.blur();
            }
          }}
          style={{ ...input, border: `1.5px solid ${color.rojo}`, fontWeight: 600 }} />
        {fila('+ Comisión 25%', formatoMXN(d.comision))}
        {fila('+ Ajuste a cifra cerrada', formatoMXN(d.ajuste))}
        {fila('= Precio de venta', formatoMXN(d.precioVenta), true)}
        {fila('IVA 16%', formatoMXN(d.iva))}
        {fila('Gestión adm. 3%', formatoMXN(d.gestionAdmin))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#000' }}>
        <label style={{ fontSize: 13, fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', color: color.crema }}>Precio público</label>
        <input type="number" inputMode="numeric" min={0} step={100} aria-label={`Precio público ${obra.titulo}`}
          value={borrador ?? Math.round(d.precioPublico)} onChange={e => setBorrador(e.target.value)} onBlur={aplicar}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              aplicar();
              e.target.blur();
            }
          }}
          style={{ ...input, border: 'none', fontWeight: 800 }} />
      </div>
    </div>
  );
}
