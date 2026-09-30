import { color } from '../../tema';

/**
 * @param {Object} props
 * @param {string} props.whatsapp
 * @param {string} props.url
 * @param {string} props.nombre
 * @param {string} props.folio
 */
export function PieContacto({ whatsapp, url, nombre, folio }) {
  const texto = `Hola ARTE FACTO, soy ${nombre} (folio ${folio}). Tengo una duda sobre mi acuerdo de consignación.`;
  const wa = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
  const boton = { display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '12px 18px', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' };
  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.15)', background: color.crema }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '18px 20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', lineHeight: 1.35 }}>
          <b style={{ fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', color: '#000' }}>¿Dudas con tu acuerdo?</b><br />
          Escríbenos, te respondemos personalmente.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...boton, background: '#000', color: color.crema }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.whatsapp }} />WhatsApp
          </a>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...boton, color: '#000', border: '1.5px solid #000' }}>
            arte-facto.mx/contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
