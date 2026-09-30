import { botonPrimario } from '../../tema';

/**
 * @param {Object} props
 * @param {() => void} props.onAtras
 * @param {() => void} [props.onSiguiente]
 * @param {boolean} [props.deshabilitado=false]
 * @param {string} [props.etiqueta='Siguiente →']
 */
export function NavegacionPasos({ onAtras, onSiguiente, deshabilitado, etiqueta = 'Siguiente →' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 34, borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: 20 }}>
      <button type="button" onClick={onAtras}
        style={{ background: 'transparent', border: '1.5px solid rgba(0,0,0,0.35)', borderRadius: 10, padding: '13px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        ← Atrás
      </button>
      {onSiguiente && (
        <button type="button" onClick={onSiguiente} disabled={deshabilitado} style={botonPrimario(deshabilitado)}>{etiqueta}</button>
      )}
    </div>
  );
}
