import { color } from '../../tema';
import { TituloPaso } from '../marco/TituloPaso';

const tarjeta = (activo) => ({
  display: 'flex', gap: 14, alignItems: 'flex-start', textAlign: 'left', width: '100%',
  background: activo ? color.rojo : '#fff', color: activo ? color.crema : '#000',
  border: activo ? '1.5px solid ' + color.rojo : '1px solid rgba(0,0,0,0.15)',
  borderRadius: 10, padding: '16px 18px', cursor: 'pointer', transition: 'all .15s',
});
const punto = (activo) => ({
  width: 18, height: 18, borderRadius: '50%', flex: 'none', marginTop: 2, boxSizing: 'border-box',
  border: activo ? '5px solid ' + color.crema : '2px solid rgba(0,0,0,0.35)', background: activo ? color.rojo : 'transparent',
});
const sub = (activo) => ({ fontSize: 12.5, color: activo ? color.crema : 'rgba(0,0,0,0.62)' });

const OPCIONES = [
  { id: 'pendiente', titulo: 'Queda pendiente', sub: 'La enviaré después; sé que es necesaria para mi factura y para mi liquidación.' },
  { id: 'tercero_sin_datos', titulo: 'Facturará un tercero, pero aún no tengo sus datos', sub: 'Otra persona o empresa emitirá la factura; enviaré su constancia en cuanto la tenga.' },
];

/**
 * @param {Object} props
 * @param {any} props.estado
 * @param {any} props.constancia
 * @param {(e: any) => void} props.onElegir
 * @param {(f: File) => void} props.onArchivo
 */
export function PasoFiscal({ estado, constancia, onElegir, onArchivo }) {
  const cargada = estado === 'cargada';
  return (
    <div>
      <TituloPaso numero="09" titulo="Situación fiscal" />
      <p style={{ fontSize: 14.5, maxWidth: 580, lineHeight: 1.45, color: 'rgba(0,0,0,0.75)', margin: '12px 0 20px' }}>
        Necesitamos tu constancia de situación fiscal —o la de quien facturará por ti— para emitir la factura de tu paquete y para liquidarte tus ventas. Elige tu caso:
      </p>
      <div role="radiogroup" style={{ display: 'grid', gap: 10, maxWidth: 580 }}>
        <div style={{ ...tarjeta(cargada), flexDirection: 'column', gap: 0, cursor: 'default' }}>
          <button type="button" role="radio" aria-checked={cargada} onClick={() => onElegir('cargada')}
            style={{ display: 'flex', gap: 14, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textAlign: 'left' }}>
            <span style={punto(cargada)} />
            <span><b style={{ display: 'block', fontSize: 14.5 }}>Cargar la constancia ahora</b>
              <span style={sub(cargada)}>Propia, o de la persona o empresa que facturará en tu nombre.</span></span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '14px 0 0 32px' }}>
            <label style={{ background: cargada ? color.crema : '#000', color: cargada ? color.rojo : color.crema, borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {constancia ? 'Cambiar archivo' : 'Seleccionar archivo'}
              <input type="file" accept="application/pdf,image/jpeg,image/png" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) onArchivo(f); }} />
            </label>
            <span style={{ fontSize: 12.5, fontWeight: constancia ? 700 : 400, color: cargada ? color.crema : 'rgba(0,0,0,0.55)' }}>
              {constancia?.nombre ?? 'PDF o imagen · máx. 10 MB'}
            </span>
          </div>
        </div>
        {OPCIONES.map(o => {
          const activo = estado === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={activo} onClick={() => onElegir(o.id)} style={tarjeta(activo)}>
              <span style={punto(activo)} />
              <span><b style={{ display: 'block', fontSize: 14.5 }}>{o.titulo}</b><span style={sub(activo)}>{o.sub}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
