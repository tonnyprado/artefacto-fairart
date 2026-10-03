import { useEffect, useState } from 'react';
import {
  PREAMBULO, CLAUSULA_1_DOCUMENTO, CIERRE_DOCUMENTO, DECLARACIONES_DOCUMENTO,
  clausulasConDescuento, formatearDescuento,
} from '../../shared/acuerdo';
import { desglosar, formatoMXN } from '../../shared/precios';
import { color } from '../../tema';

const ETIQUETA_FISCAL = {
  cargada: 'Cargada', pendiente: 'Pendiente de entrega', tercero_sin_datos: 'Facturará un tercero — datos pendientes',
};

const th = { textAlign: 'left', padding: '6px 8px', borderBottom: '1.5px solid ' + color.rojo };
const td = { padding: '5px 8px', borderBottom: '1px solid #eee' };

/**
 * Convierte un data URL a Blob URL (más eficiente para el navegador)
 * @param {string | null} dataUrl
 * @returns {string | null}
 */
function dataUrlABlobUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  try {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(base64);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error convirtiendo data URL a Blob URL:', e);
    return dataUrl; // fallback al data URL original
  }
}

/**
 * Vista HTML del PDF (espejo de backend/src/pdf/PdfKitGenerador.ts).
 * @param {Object} p
 */
export function DocumentoAcuerdo(p) {
  const a = p.artista;
  // Convertir data URL de firma a Blob URL para mejor rendimiento
  const [firmaUrl, setFirmaUrl] = useState(null);

  useEffect(() => {
    if (p.firmaArtista) {
      const blobUrl = dataUrlABlobUrl(p.firmaArtista);
      setFirmaUrl(blobUrl);
      // Cleanup: revocar Blob URL cuando el componente se desmonte
      return () => {
        if (blobUrl && blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
      };
    }
  }, [p.firmaArtista]);
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 'clamp(22px,5vw,48px)', fontSize: 11.5, lineHeight: 1.5, color: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, borderBottom: '2.5px solid ' + color.rojo, paddingBottom: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 22, letterSpacing: '-0.04em', color: color.rojo, lineHeight: 0.95 }}>Acuerdo de<br />Consignación de Obra</div>
        <div style={{ textAlign: 'right', fontSize: 10.5, color: '#444' }}>
          ARTE FACTO | Éticas Creativas — Segunda Edición<br />
          Fecha: <b>{p.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</b> · Lugar: Ciudad de México<br />
          Folio: <b>{a.folio}</b>
        </div>
      </div>

      <p style={{ margin: '0 0 8px', whiteSpace: 'pre-line' }}>{PREAMBULO}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '6px 18px', background: color.cremaPapel, borderRadius: 6, padding: '12px 14px', margin: '12px 0 14px', fontSize: 11 }}>
        <span style={{ gridColumn: '1/-1' }}><b>Artista o colectivo:</b> {a.nombre}</span>
        <span><b>Folio de participación:</b> {a.folio}</span><span><b>Paquete:</b> {a.paquete}</span>
        <span><b>Correo:</b> {a.correo}</span><span><b>Teléfono:</b> {a.telefono}</span>
      </div>

      <b style={{ display: 'block', color: color.rojo }}>1 · Obra en consignación</b>
      <p style={{ margin: '2px 0 8px' }}>{CLAUSULA_1_DOCUMENTO.intro}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 10.5, marginBottom: 8 }}>
          <thead style={{ display: 'table-header-group' }}><tr>
            <th style={th}>Título</th><th style={th}>Técnica y año</th><th style={th}>Medida (con marco)</th>
            <th style={{ ...th, textAlign: 'right' }}>Precio de venta</th><th style={{ ...th, textAlign: 'right' }}>Precio público con IVA</th>
          </tr></thead>
          <tbody>
            {p.obras.map(o => {
              const d = desglosar(p.ganancias[o.id] ?? o.gananciaRegistrada);
              return (
                <tr key={o.id} style={{ breakInside: 'avoid' }}>
                  <td style={td}><b>{o.titulo}</b></td><td style={td}>{o.tecnica}</td><td style={td}>{o.medida}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{formatoMXN(d.precioVenta)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800 }}>{formatoMXN(d.precioPublico)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ margin: '0 0 4px' }}><b>Descuento máximo autorizado:</b> {formatearDescuento(p.descuentoMax)} sobre el precio de venta.</p>
      <p style={{ margin: '0 0 4px' }}>{CLAUSULA_1_DOCUMENTO.estado}</p>
      <p style={{ margin: '0 0 10px', whiteSpace: 'pre-line' }}>{CLAUSULA_1_DOCUMENTO.cierre}</p>

      {clausulasConDescuento(p.descuentoMax).slice(1).map(c => (
        <div key={c.n} style={{ marginBottom: 9 }}>
          <b style={{ color: color.rojo }}>{c.n} · {c.titulo}</b><br />
          <span style={{ whiteSpace: 'pre-line', color: '#222' }}>{c.textoLegal}</span>
        </div>
      ))}

      <div style={{ marginBottom: 9 }}>
        <b style={{ color: color.rojo }}>9 · Aceptación de riesgo</b><br />El/la artista declara que:
        {DECLARACIONES_DOCUMENTO.map(d => <div key={d} style={{ paddingLeft: 12 }}>— {d}</div>)}
        <div style={{ marginTop: 4 }}>{CIERRE_DOCUMENTO}</div>
      </div>

      <div style={{ background: color.cremaPapel, borderRadius: 6, padding: '10px 14px', margin: '12px 0', fontSize: 11 }}>
        <b style={{ color: color.rojo }}>Constancia de situación fiscal:</b>{' '}
        {p.estadoFiscal ? ETIQUETA_FISCAL[p.estadoFiscal] + (p.constanciaNombre ? ' (' + p.constanciaNombre + ')' : '') : '—'}
      </div>
      <div style={{ border: '1.5px solid ' + color.rojo, borderRadius: 6, padding: '10px 14px', margin: '12px 0', fontSize: 11 }}>
        <b style={{ color: color.rojo, display: 'block', marginBottom: 4 }}>Datos de transferencia para el pago del paquete</b>
        <div style={{ display: 'flex', gap: '6px 20px', flexWrap: 'wrap' }}>
          <span><b>Beneficiario:</b> {p.datosPago.beneficiario}</span><span><b>Banco:</b> {p.datosPago.banco}</span>
          <span><b>CLABE:</b> {p.datosPago.clabe}</span><span><b>Cuenta:</b> {p.datosPago.cuenta}</span>
          <span><b>Concepto:</b> {p.datosPago.concepto}</span>
        </div>
        <div style={{ marginTop: 4, color: '#444' }}>{p.datosPago.plazos}</div>
      </div>

      <b style={{ display: 'block', margin: '20px 0 0' }}>Firmas de conformidad</b>
      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginTop: 14 }}>
        {[
          { img: firmaUrl, nombre: a.nombre, rol: 'Firma del/la artista' },
          { img: p.firmaDireccionUrl, nombre: 'Benito García Prieto Pérez', rol: 'Dirección de ARTE FACTO' },
        ].map(f => (
          <div key={f.rol} style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {f.img ? (
                <img src={f.img} alt={f.rol} style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Error al cargar firma:', f.rol, 'URL:', f.img?.substring(0, 50));
                    e.target.style.display = 'none';
                  }} />
              ) : (
                <span style={{ fontSize: 11, color: '#999' }}>Cargando firma…</span>
              )}
            </div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 5, fontSize: 10.5 }}><b>{f.nombre}</b><br />{f.rol}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
