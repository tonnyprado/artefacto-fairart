import { color } from '../../tema';
import { ETIQUETAS_PASO, TOTAL_PASOS } from '../../estado/consignaReducer';

/**
 * Segmentos clicables: se puede saltar a cualquier paso ya visitado (incluso tras firmar).
 * @param {Object} props
 * @param {number} props.paso
 * @param {number} props.maxPaso
 * @param {(paso: number) => void} props.onIr
 */
export function BarraProgreso({ paso, maxPaso, onIr }) {
  const actual = Math.min(paso, TOTAL_PASOS);
  return (
    <div style={{ background: color.crema, borderBottom: '1px solid rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 5 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ fontWeight: 800, fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase', color: color.rojo }}>
            Paso {actual} de {TOTAL_PASOS}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.6)' }}>{ETIQUETAS_PASO[actual]}</div>
        </div>
        <nav aria-label="Pasos del acuerdo" style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: TOTAL_PASOS }, (_, i) => {
            const n = i + 1, bloqueado = n > Math.max(maxPaso, paso), esActual = n === actual;
            return (
              <button key={n} type="button" disabled={bloqueado} onClick={() => onIr(n)}
                aria-label={`${n} · ${ETIQUETAS_PASO[n]}`} aria-current={esActual ? 'step' : undefined}
                style={{ flex: 1, height: esActual ? 8 : 6, border: 'none', padding: 0, borderRadius: 3,
                  cursor: bloqueado ? 'default' : 'pointer', transition: 'all .2s',
                  background: esActual ? color.rojo : n <= maxPaso ? color.negro : 'rgba(0,0,0,0.14)' }} />
            );
          })}
        </nav>
      </div>
    </div>
  );
}
