import { useState } from 'react';
import { desglosar, gananciaDesdePublico, formatoMXN } from '../../shared/precios';
import { color } from '../../tema';

const celda = { padding: '12px 10px', textAlign: 'right', color: 'rgba(0,0,0,0.75)' };
const input = { textAlign: 'right', padding: '8px 9px', borderRadius: 8, fontSize: 16, background: '#fff' };

/**
 * @param {Object} props
 * @param {any} props.obra
 * @param {number} props.ganancia
 * @param {(g: number) => void} props.onGanancia
 */
export function FilaObra({ obra, ganancia, onGanancia }) {
  const d = desglosar(ganancia);
  // Borrador local del precio público: se aplica al salir del campo o con Enter
  const [borrador, setBorrador] = useState(null);
  const aplicar = () => { if (borrador !== null) { onGanancia(gananciaDesdePublico(Number(borrador) || 0)); setBorrador(null); } };
  const modificada = Math.round(ganancia) !== obra.gananciaRegistrada;

  return (
    <tr style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <td style={{ padding: '12px 14px', minWidth: 180 }}>
        <b style={{ fontSize: 14 }}>{obra.titulo}</b><br />
        <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.6)' }}>{obra.tecnica} · {obra.medida}</span>
        {modificada && (<><br /><span style={{ display: 'inline-block', marginTop: 4, background: color.rojo, color: color.crema, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4 }}>
          Ajustada · antes {formatoMXN(obra.gananciaRegistrada)}</span></>)}
      </td>
      <td style={{ padding: 10, textAlign: 'right' }}>
        <input type="number" min={0} step={100} value={Math.round(ganancia)} aria-label={`Ganancia ${obra.titulo}`}
          onChange={e => onGanancia(Number(e.target.value) || 0)}
          style={{ ...input, width: 96, border: `1.5px solid ${color.rojo}`, fontWeight: 600 }} />
      </td>
      <td style={celda}>{formatoMXN(d.comision)}</td>
      <td style={celda}>{formatoMXN(d.ajuste)}</td>
      <td style={{ ...celda, fontWeight: 800, color: color.rojoOscuro, background: 'rgba(185,50,50,0.06)' }}>{formatoMXN(d.precioVenta)}</td>
      <td style={celda}>{formatoMXN(d.iva)}</td>
      <td style={celda}>{formatoMXN(d.gestionAdmin)}</td>
      <td style={{ padding: '10px 14px', textAlign: 'right', background: 'rgba(0,0,0,0.04)' }}>
        <input type="number" min={0} step={100} aria-label={`Precio público ${obra.titulo}`}
          value={borrador ?? Math.round(d.precioPublico)}
          onChange={e => setBorrador(e.target.value)} onBlur={aplicar}
          onKeyDown={e => e.key === 'Enter' && (e.target).blur()}
          style={{ ...input, width: 106, border: '1.5px solid #000', fontWeight: 800 }} />
      </td>
    </tr>
  );
}
