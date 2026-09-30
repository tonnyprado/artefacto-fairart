import { useLienzoFirma } from '../../hooks/useLienzoFirma';
import { useEsVertical } from '../../hooks/useEsVertical';
import { color, fuente, botonPrimario, botonSecundario } from '../../tema';

/**
 * Overlay a pantalla completa. En celular vertical se rota 90° para firmar en horizontal.
 * @param {Object} props
 * @param {string} props.nombre
 * @param {(png: string) => void} props.onGuardar
 * @param {() => void} props.onCancelar
 */
export function LienzoFirma({ nombre, onGuardar, onCancelar }) {
  const vertical = useEsVertical();
  const { canvas, handlers, limpiar, exportarPng, tieneTinta } = useLienzoFirma();

  const base = { position: 'fixed', background: color.crema, zIndex: 1000, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
  const marco = vertical
    ? { ...base, top: 0, left: '100vw', width: '100vh', height: '100vw', transform: 'rotate(90deg)', transformOrigin: 'top left', padding: '18px 22px' }
    : { ...base, inset: 0, padding: '22px 28px' };

  return (
    <div role="dialog" aria-modal="true" aria-label="Firma" style={marco}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 20, color: color.rojo }}>Firma aquí</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>Con el dedo o el cursor · puedes rehacerla las veces que quieras</div>
        </div>
        <div style={{ fontFamily: fuente.serif, fontStyle: 'italic', fontSize: 15, color: 'rgba(0,0,0,0.55)' }}>{nombre}</div>
      </div>
      <div style={{ flex: 1, background: '#fff', border: '2px dashed rgba(185,50,50,0.5)', borderRadius: 12, margin: '12px 0', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <canvas ref={canvas} width={1400} height={560} {...handlers}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
        <div style={{ position: 'absolute', left: '6%', right: '6%', bottom: '22%', borderBottom: '1.5px solid rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancelar} style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.6)', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>Cancelar</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={limpiar} style={botonSecundario}>Rehacer</button>
          <button type="button" disabled={!tieneTinta} style={botonPrimario(!tieneTinta)}
            onClick={() => { const png = exportarPng(); if (png) onGuardar(png); }}>Guardar firma →</button>
        </div>
      </div>
    </div>
  );
}
