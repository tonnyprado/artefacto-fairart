import { color, degradadoHero, fuente, botonPrimario } from '../../tema';

/**
 * @param {Object} props
 * @param {any} props.artista
 * @param {number} props.numObras
 * @param {() => void} props.onComenzar
 */
export function PasoBienvenida({ artista, numObras, onComenzar }) {
  const dato = (k, v) => (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5 }}>
      <b style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: color.rojo }}>{k}</b>{v}
    </div>
  );
  return (
    <div>
      <div style={{ background: degradadoHero, borderRadius: 14, padding: '44px 34px 38px', marginBottom: 26 }}>
        <div style={{ color: '#fff', mixBlendMode: 'overlay', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 14 }}>
          Tu obra fue seleccionada para la Segunda Edición
        </div>
        <h1 style={{ margin: 0, color: color.crema, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(30px,6vw,52px)', lineHeight: 0.92, letterSpacing: '-0.04em' }}>
          Hola,<br />{artista.nombre}
        </h1>
        <p style={{ fontFamily: fuente.serif, fontStyle: 'italic', color: color.crema, fontSize: 'clamp(17px,2.6vw,21px)', margin: '18px 0 0', maxWidth: 540, lineHeight: 1.3 }}>
          Gracias por confiar tu obra a Arte Facto. Este es tu acuerdo de consignación: lo dividimos en pasos para que lo leas con calma, revises tus precios y firmes desde aquí.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
        {dato('Folio', artista.folio)}{dato('Paquete', artista.paquete)}{dato('Obras postuladas', numObras + ' piezas')}
      </div>
      <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', maxWidth: 540, lineHeight: 1.45, margin: '0 0 20px' }}>
        Son <b>12 pasos</b> (~8 minutos): 8 condiciones del acuerdo, tu situación fiscal, la revisión de precios de tus obras, tu firma y el envío del documento. Puedes regresar a cualquier paso cuando quieras, incluso después de firmar.
      </p>
      <button type="button" onClick={onComenzar} style={{ ...botonPrimario(), padding: '16px 34px', fontSize: 16 }}>Comenzar →</button>
    </div>
  );
}
