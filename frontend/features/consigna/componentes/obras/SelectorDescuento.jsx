import { useState } from 'react';
import { color } from '../../tema';

const PRESETS = [0, 5, 10, 15];
const SUGERIDO = 10;

/**
 * Cotejado con cláusula 5: el artista define aquí el % máximo de descuento.
 * @param {Object} props
 * @param {number | null} props.valor
 * @param {(v: number | null) => void} props.onCambiar
 */
export function SelectorDescuento({ valor, onCambiar }) {
  const [personalizado, setPersonalizado] = useState(valor !== null && !PRESETS.includes(valor));
  const nota = valor === null ? 'Elige una opción para continuar.'
    : valor === 0 ? 'No autorizas descuentos: tus obras se venden al precio de venta.'
    : `Autorizas hasta ${valor}% de descuento sobre el precio de venta. Uno mayor requerirá tu autorización por escrito.`;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '18px 20px', marginTop: 20 }}>
      <div style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 16 }}>Descuento que autorizas</div>
      <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', margin: '4px 0 14px', lineHeight: 1.45, maxWidth: 600 }}>
        Porcentaje máximo que ARTE FACTO podrá ofrecer sobre el precio de venta de tus obras para facilitar una venta (cláusula 5). Sugerimos 10%.
      </p>
      <div role="radiogroup" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {PRESETS.map(v => {
          const activo = valor === v && !personalizado;
          return (
            <button key={v} type="button" role="radio" aria-checked={activo}
              onClick={() => { setPersonalizado(false); onCambiar(v); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 84,
                background: activo ? color.rojo : '#fff', color: activo ? color.crema : '#000',
                border: activo ? `1.5px solid ${color.rojo}` : '1px solid rgba(0,0,0,0.18)', borderRadius: 10,
                padding: '10px 14px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              <span>{v === 0 ? 'Sin descuento' : `${v}%`}</span>
              {v === SUGERIDO && <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>Sugerido</span>}
            </button>
          );
        })}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Otro:
          <input type="number" min={0} max={100} placeholder="%" value={personalizado && valor !== null ? valor : ''}
            onChange={e => {
              if (e.target.value === '') { setPersonalizado(false); onCambiar(null); return; }
              setPersonalizado(true); onCambiar(Math.min(100, Math.max(0, Math.round(Number(e.target.value)))));
            }}
            style={{ width: 78, textAlign: 'center', padding: '12px 10px', borderRadius: 10, fontSize: 14, fontWeight: 800,
              border: personalizado ? `1.5px solid ${color.rojo}` : '1px solid rgba(0,0,0,0.18)' }} />%
        </label>
      </div>
      <p style={{ fontSize: 12.5, color: color.rojo, fontWeight: 600, margin: '12px 0 0' }}>{nota}</p>
    </div>
  );
}
