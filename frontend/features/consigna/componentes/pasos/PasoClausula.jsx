import { color } from '../../tema';
import { TituloPaso } from '../marco/TituloPaso';

/**
 * Pasos 1–8. `extra` permite insertar contenido específico (ej. datos de pago en el 6) sin modificar este componente (OCP).
 * @param {Object} props
 * @param {any} props.clausula
 * @param {any} [props.extra]
 */
export function PasoClausula({ clausula, extra }) {
  return (
    <div>
      <TituloPaso numero={clausula.n.padStart(2, '0')} titulo={clausula.titulo} />
      <div style={{ display: 'grid', gap: 10, margin: '18px 0 22px' }}>
        {clausula.resumen.map((b, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.rojo, marginTop: 6, flex: 'none' }} />
            <div style={{ fontSize: 15, lineHeight: 1.4, textWrap: 'pretty' }}>{b}</div>
          </div>
        ))}
      </div>
      {extra}
      <details style={{ marginBottom: 10 }}>
        <summary style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: color.rojo, textTransform: 'uppercase' }}>Ver texto legal completo</summary>
        <p style={{ background: 'rgba(255,255,255,0.55)', borderLeft: '3px solid ' + color.rojo, borderRadius: '0 8px 8px 0', padding: '14px 16px', fontSize: 13, lineHeight: 1.55, color: 'rgba(0,0,0,0.78)', marginTop: 8, whiteSpace: 'pre-line' }}>
          {clausula.textoLegal}
        </p>
      </details>
    </div>
  );
}
