import { useState } from 'react';
import { color } from '../../tema';

const agrupar = (clabe) => clabe.slice(0, 3) + ' ' + clabe.slice(3, 6) + ' ' + clabe.slice(6, 17) + ' ' + clabe.slice(17);

/**
 * @param {Object} props
 * @param {any} props.datos
 */
export function DatosTransferencia({ datos }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(datos.clabe); } catch { /* sin permisos */ }
    setCopiado(true); setTimeout(() => setCopiado(false), 1800);
  };
  const etiqueta = { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.8 };
  const campo = (k, v) => <div><div style={etiqueta}>{k}</div>{v}</div>;
  return (
    <div style={{ background: '#000', color: color.crema, borderRadius: 12, padding: '20px 22px', margin: '0 0 22px', maxWidth: 620 }}>
      <div style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 15, marginBottom: 4 }}>Datos para transferir tu paquete</div>
      <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 14 }}>{datos.plazos} Envíanos tu comprobante por WhatsApp.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px 22px' }}>
        {campo('Beneficiario', <div style={{ fontSize: 14, fontWeight: 700 }}>{datos.beneficiario}</div>)}
        {campo('Banco', <div style={{ fontSize: 14, fontWeight: 700 }}>{datos.banco}</div>)}
        {campo('Cuenta CLABE', (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{agrupar(datos.clabe)}</span>
            <button type="button" onClick={copiar} style={{ background: color.rojo, color: color.crema, border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
              {copiado ? '¡Copiada!' : 'Copiar'}
            </button>
          </div>
        ))}
        {campo('Número de cuenta', <div style={{ fontSize: 17, fontWeight: 800 }}>{datos.cuenta}</div>)}
        {campo('Concepto sugerido', <div style={{ fontSize: 14, fontWeight: 700 }}>{datos.concepto}</div>)}
      </div>
    </div>
  );
}
