import { color, fuente, botonPrimario, botonSecundario } from '../../tema';

/**
 * @param {Object} props
 * @param {string} props.nombrePila
 * @param {string} props.correo
 * @param {() => void} props.onRevisar
 * @param {() => void} props.onDescargar
 */
export function PasoEnviado({ nombrePila, correo, onRevisar, onDescargar }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 10px 20px' }}>
      <div style={{ width: 74, height: 74, borderRadius: '50%', background: color.rojo, color: color.crema, fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>✓</div>
      <h2 style={{ margin: '0 0 10px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(26px,5vw,40px)' }}>Acuerdo recibido</h2>
      <p style={{ fontFamily: fuente.serif, fontStyle: 'italic', fontSize: 18, maxWidth: 440, margin: '0 auto 8px' }}>Gracias, {nombrePila}. Nos vemos en Estación Indianilla.</p>
      <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.65)', maxWidth: 460, margin: '0 auto 26px', lineHeight: 1.45 }}>
        Te enviamos copia del PDF firmado a {correo}. Recuerda cubrir el 50% de tu paquete en las próximas 24 horas. Recepción de obra: 30 de enero al 1 de febrero de 2027.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={onRevisar} style={botonPrimario()}>Volver a revisar mi acuerdo</button>
        <button type="button" onClick={onDescargar} style={botonSecundario}>Descargar mi PDF</button>
      </div>
    </div>
  );
}
