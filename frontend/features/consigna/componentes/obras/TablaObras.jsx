import { color } from '../../tema';
import { FilaObra } from './FilaObra';
import { TarjetaObra } from './TarjetaObra';
import { useEsAngosto } from '../../hooks/useEsVertical';

const COLUMNAS = [
  ['Obra'], ['Tu ganancia 75%'], ['Comisión 25%'], ['= Precio base', color.rojoOscuro],
  ['+ IVA 16%'], ['+ Gestión adm. 3%'], ['+ Ajuste'], ['Precio público', '#000'],
];

/**
 * @param {Object} props
 * @param {any[]} props.obras
 * @param {Record<string, number>} props.ganancias
 * @param {(obraId: string, g: number) => void} props.onGanancia
 */
export function TablaObras({ obras, ganancias, onGanancia }) {
  const angosto = useEsAngosto();
  const cambios = obras.filter(o => Math.round(ganancias[o.id]) !== o.gananciaRegistrada).length;
  return (
    <>
      {angosto ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {obras.map(o => <TarjetaObra key={o.id} obra={o} ganancia={ganancias[o.id]} onGanancia={g => onGanancia(o.id, g)} />)}
        </div>
      ) : (
      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 980, fontSize: 13 }}>
          <thead>
            <tr>
              {COLUMNAS.map(([t, fondo], i) => (
                <th key={t} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '12px 10px', background: fondo ?? color.rojo, color: color.crema, fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 11 }}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {obras.map(o => <FilaObra key={o.id} obra={o} ganancia={ganancias[o.id]} onGanancia={g => onGanancia(o.id, g)} />)}
          </tbody>
        </table>
      </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 12.5, color: 'rgba(0,0,0,0.62)', lineHeight: 1.45 }}>
        <span style={{ maxWidth: 560 }}>El ajuste cierra el precio base al múltiplo de $100 inmediato superior y también se reparte 75/25. IVA y gestión administrativa los paga el comprador; tú recibes el 75% del precio base más su IVA.</span>
        <b style={{ color: '#000' }}>
          {cambios ? cambios === 1 ? 'precio ajustado — registraremos la diferencia' : 'precios ajustados — registraremos las diferencias' : 'Sin cambios sobre tu registro'}
        </b>
      </div>
    </>
  );
}
