import { useState } from 'react';
import { DECLARACIONES_PANTALLA } from '../../shared/acuerdo';
import { color, botonPrimario } from '../../tema';
import { TituloPaso } from '../marco/TituloPaso';
import { LienzoFirma } from '../firma/LienzoFirma';

/**
 * @param {Object} props
 * @param {string} props.nombre
 * @param {boolean} props.acepto
 * @param {string | null} props.firma
 * @param {(v: boolean) => void} props.onAcepto
 * @param {(png: string) => void} props.onFirma
 */
export function PasoFirma({ nombre, acepto, firma, onAcepto, onFirma }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div>
      <TituloPaso numero="11" titulo="Aceptación y firma" />
      <p style={{ fontSize: 14.5, maxWidth: 580, color: 'rgba(0,0,0,0.75)', margin: '12px 0 14px' }}>Al firmar declaras que:</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 580, marginBottom: 18 }}>
        {DECLARACIONES_PANTALLA.map(d => (
          <div key={d} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.4 }}>
            <span style={{ color: color.rojo, fontWeight: 900 }}>✓</span><span>{d}</span>
          </div>
        ))}
      </div>
      <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '16px 18px', maxWidth: 580, cursor: 'pointer', marginBottom: 20 }}>
        <input type="checkbox" checked={acepto} onChange={e => onAcepto(e.target.checked)} style={{ width: 20, height: 20, accentColor: color.rojo, flex: 'none' }} />
        <span style={{ fontSize: 14, lineHeight: 1.4 }}>He leído y acepto el Acuerdo de Consignación de Obra de ARTE FACTO · Segunda Edición, las condiciones de los pasos 1 a 8 y los precios de la tabla de obras.</span>
      </label>

      {!firma ? (
        <>
          <button type="button" disabled={!acepto} onClick={() => setAbierto(true)} style={{ ...botonPrimario(!acepto), padding: '16px 34px', fontSize: 16 }}>
            OK, firmar con el dedo →
          </button>
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 10 }}>Se abrirá un recuadro en pantalla completa; en celular gira a horizontal.</p>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '16px 18px', maxWidth: 580, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, height: 64 }}><img src={firma} alt="Tu firma" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: color.rojo }}>Firma guardada</span>
            <button type="button" onClick={() => setAbierto(true)} style={{ background: 'transparent', border: '1.5px solid #000', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Rehacer firma</button>
          </div>
        </div>
      )}

      {abierto && <LienzoFirma nombre={nombre} onCancelar={() => setAbierto(false)} onGuardar={png => { onFirma(png); setAbierto(false); }} />}
    </div>
  );
}
