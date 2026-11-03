import { color } from '../../tema';
import { FilaObra } from './FilaObra';
import { TarjetaObra } from './TarjetaObra';
import { useEsAngosto } from '../../hooks/useEsVertical';
import { desglosar, formatoMXN, formatoMXNPublico } from '../../shared/precios';

const COLUMNAS = [
  ['Obra'],
  ['Ingreso del artista · 75%'],
  ['Comisión ARTE FACTO · 25%'],
  ['= Precio base', color.vino],
  ['+ Gestión administrativa · 4%'],
  ['= Subtotal', '#8a1a1a'],
  ['+ IVA · 16%'],
  ['Precio público', '#000'],
];

/**
 * @param {Object} props
 * @param {any[]} props.obras
 * @param {Record<string, number>} props.ganancias
 * @param {Record<string, boolean>} props.touched
 * @param {(obraId: string, g: number) => void} props.onGanancia
 */
export function TablaObras({ obras, ganancias, touched, onGanancia }) {
  const angosto = useEsAngosto();
  const cambios = obras.filter(o => Math.round(ganancias[o.id]) !== o.gananciaRegistrada).length;
  const modificacionesManual = obras.filter(o => touched[o.id]).length;
  const ajustesAutomaticos = cambios - modificacionesManual;

  // Calcular totales
  const totales = obras.reduce(
    (acc, obra) => {
      const d = desglosar(ganancias[obra.id] ?? obra.gananciaRegistrada);
      return {
        ingreso: acc.ingreso + d.ingreso,
        comision: acc.comision + d.comision,
        precioBase: acc.precioBase + d.precioBase,
        gestion: acc.gestion + d.gestion,
        subtotal: acc.subtotal + d.subtotal,
        iva: acc.iva + d.iva,
        precioPublico: acc.precioPublico + d.precioPublico,
      };
    },
    { ingreso: 0, comision: 0, precioBase: 0, gestion: 0, subtotal: 0, iva: 0, precioPublico: 0 }
  );

  return (
    <>
      {angosto ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {obras.map(o => <TarjetaObra key={o.id} obra={o} ganancia={ganancias[o.id]} touched={touched[o.id]} onGanancia={g => onGanancia(o.id, g)} />)}
        </div>
      ) : (
      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1100, fontSize: 13 }}>
          <thead>
            <tr>
              {COLUMNAS.map(([t, fondo], i) => (
                <th key={t} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '12px 10px', background: fondo ?? color.rojo, color: color.crema, fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 11 }}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {obras.map(o => <FilaObra key={o.id} obra={o} ganancia={ganancias[o.id]} touched={touched[o.id]} onGanancia={g => onGanancia(o.id, g)} />)}
            <tr style={{ borderTop: '2px solid rgba(0,0,0,0.2)', background: 'rgba(0,0,0,0.02)' }}>
              <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: 14 }}>TOTALES</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>{formatoMXN(totales.ingreso)}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>{formatoMXN(totales.comision)}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: color.vino, background: 'rgba(115,0,0,0.10)' }}>{formatoMXN(totales.precioBase)}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>{formatoMXN(totales.gestion)}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, background: 'rgba(115,0,0,0.05)' }}>{formatoMXN(totales.subtotal)}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>{formatoMXN(totales.iva)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', background: '#E3DCCF', fontWeight: 800, fontSize: 15 }}>{formatoMXNPublico(totales.precioPublico)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 12.5, color: 'rgba(0,0,0,0.62)', lineHeight: 1.45 }}>
        <span style={{ maxWidth: 560 }}>
          <b style={{ color: color.vino }}>¿Por qué cambió tu ingreso?</b> Si ves que tu ingreso sube un poco respecto a lo que registraste, es por el ajuste que hacemos para que el precio final al público cierre en un número redondo (el múltiplo de $100 superior más cercano) y no quede en una cifra irregular. Ese ajuste se distribuye en todo el desglose, así que recibes un poco más de lo que pusiste. La Gestión administrativa y el IVA los paga el comprador y no reducen lo que recibes.
        </span>
        <b style={{ color: '#000' }}>
          {modificacionesManual > 0
            ? (modificacionesManual === 1 ? 'Precio ajustado — registraremos la diferencia' : 'Precios ajustados — registraremos las diferencias')
            : (ajustesAutomaticos > 0 ? 'Ajuste automático para cerrar el precio al público' : 'Sin cambios sobre tu registro')
          }
        </b>
      </div>
    </>
  );
}
