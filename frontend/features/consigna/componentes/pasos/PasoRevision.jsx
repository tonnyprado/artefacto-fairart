import { DocumentoAcuerdo } from '../documento/DocumentoAcuerdo';
import { TituloPaso } from '../marco/TituloPaso';
import { botonPrimario, botonSecundario } from '../../tema';

/**
 * @param {Object} props
 * @param {any} props.documento
 * @param {boolean} props.enviado
 * @param {boolean} props.enviando
 * @param {string | null} props.error
 * @param {() => void} props.onEnviar
 * @param {() => void} props.onDescargar
 */
export function PasoRevision({ documento, enviado, enviando, error, onEnviar, onDescargar }) {
  return (
    <div>
      <TituloPaso numero="12" titulo="Revisa y envía" />
      {enviado && (
        <div style={{ background: '#000', color: '#E8DED0', borderRadius: 10, padding: '12px 16px', fontSize: 13, margin: '8px 0 14px' }}>
          Ya enviaste este acuerdo. Si necesitas cambiar algo, escríbenos por WhatsApp.
        </div>
      )}
      <DocumentoAcuerdo {...documento} />
      {error && <p role="alert" style={{ color: '#B93232', fontWeight: 700, fontSize: 13, marginTop: 14 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
        {!enviado && (
          <button type="button" onClick={onEnviar} disabled={enviando} style={{ ...botonPrimario(enviando), padding: '15px 32px' }}>
            {enviando ? 'Enviando…' : 'Enviar acuerdo firmado'}
          </button>
        )}
        <button type="button" onClick={onDescargar} style={{ ...botonSecundario, padding: '15px 26px' }}>Descargar PDF</button>
      </div>
    </div>
  );
}
