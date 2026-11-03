import { useState } from 'react';
import { desglosar, desglosarDesdePublico, ingresoDesdePublico, formatoMXN } from '../../shared/precios';
import { color } from '../../tema';

const celda = { padding: '12px 10px', textAlign: 'right', color: 'rgba(0,0,0,0.75)' };
const input = {
  textAlign: 'right',
  padding: '8px 9px',
  borderRadius: 8,
  fontSize: 16,
  background: '#fff',
};

// CSS para ocultar spinners de input number
const estilosSpinner = `
  .input-sin-spinner::-webkit-outer-spin-button,
  .input-sin-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .input-sin-spinner[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`;

/**
 * Componente para mostrar el delta de ajuste debajo de un número
 * @param {number} delta - Diferencia entre valor final y crudo
 */
function AjusteDisplay({ delta }) {
  // Solo mostrar si hay ajuste significativo (> 0.005)
  if (!delta || Math.abs(delta) <= 0.005) return null;

  return (
    <div style={{ fontSize: 10.5, fontWeight: 600, color: color.vino, marginTop: 3, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 8.5, color: 'rgba(0,0,0,0.5)', marginRight: 4, fontWeight: 500 }}>ajustado</span>
      {formatoMXN(delta)}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {any} props.obra
 * @param {number} props.ganancia
 * @param {boolean} props.touched
 * @param {(g: number) => void} props.onGanancia
 */
export function FilaObra({ obra, ganancia, touched, onGanancia }) {
  // Borrador local del precio público: se aplica al hacer clic en "Aplicar"
  const [borrador, setBorrador] = useState(null);

  // Cuando hay borrador activo, calculamos desde precio público (sin redondeo, sin crudo)
  // Cuando no hay borrador, calculamos desde ganancia (con redondeo y crudo)
  const d = borrador !== null
    ? desglosarDesdePublico(parseFloat(borrador) || 0)
    : desglosar(ganancia);

  const aplicar = () => {
    if (borrador !== null) {
      const valorNumerico = parseFloat(borrador);
      if (!isNaN(valorNumerico) && valorNumerico >= 0) {
        onGanancia(ingresoDesdePublico(valorNumerico));
      }
      setBorrador(null);
    }
  };

  // Determinar estado de la pastilla - SOLO mostrar cuando touched (edición manual)
  // Según spec sección 5: mostrarPastilla = tocado
  const mostrarPastilla = touched;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: estilosSpinner }} />
      <tr style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <td style={{ padding: '12px 14px', minWidth: 180 }}>
          <b style={{ fontSize: 12.5 }}>{obra.titulo}</b><br />
          <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.6)' }}>{obra.tecnica} · {obra.medida}</span>
          {mostrarPastilla && (<><br /><span style={{ display: 'inline-block', marginTop: 6, background: color.rojo, color: color.crema, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', padding: '5px 11px', borderRadius: 6, whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.35, maxWidth: 215 }}>
            Registraste inicialmente {formatoMXN(obra.gananciaRegistrada)}
          </span></>)}
        </td>
        <td style={{ padding: 10, textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <input type="number" min={0} step={100} value={Math.round(ganancia)} aria-label={`Ingreso ${obra.titulo}`}
              className="input-sin-spinner"
              onChange={e => {
                const valor = parseFloat(e.target.value);
                onGanancia(!isNaN(valor) && valor >= 0 ? valor : 0);
              }}
              style={{ ...input, width: 96, border: `1.5px solid ${color.rojo}`, fontWeight: 600 }} />
            <AjusteDisplay delta={d.crudo ? d.ingreso - d.crudo.ingreso : 0} />
          </div>
        </td>
        <td style={celda}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{formatoMXN(d.comision)}</span>
            <AjusteDisplay delta={d.crudo ? d.comision - d.crudo.comision : 0} />
          </div>
        </td>
        <td style={{ ...celda, fontWeight: 800, color: color.vino, background: 'rgba(115,0,0,0.10)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{formatoMXN(d.precioBase)}</span>
            <AjusteDisplay delta={d.crudo ? d.precioBase - d.crudo.precioBase : 0} />
          </div>
        </td>
        <td style={celda}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{formatoMXN(d.gestion)}</span>
            <AjusteDisplay delta={d.crudo ? d.gestion - d.crudo.gestion : 0} />
          </div>
        </td>
        <td style={{ ...celda, fontWeight: 600, background: 'rgba(115,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{formatoMXN(d.subtotal)}</span>
            <AjusteDisplay delta={d.crudo ? d.subtotal - d.crudo.subtotal : 0} />
          </div>
        </td>
        <td style={celda}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{formatoMXN(d.iva)}</span>
            <AjusteDisplay delta={d.crudo ? d.iva - d.crudo.iva : 0} />
          </div>
        </td>
        <td style={{ padding: '10px 14px', textAlign: 'right', background: '#E3DCCF' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
            <input type="number" min={0} step={100} aria-label={`Precio público ${obra.titulo}`}
              className="input-sin-spinner"
              value={borrador ?? Math.round(d.precioPublico)}
              onChange={e => setBorrador(e.target.value)}
              style={{ ...input, width: 140, border: '1.5px solid #000', fontWeight: 800 }} />
            {borrador !== null && (
              <button
                onClick={aplicar}
                aria-label="Aplicar precio público"
                style={{
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Aplicar
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
