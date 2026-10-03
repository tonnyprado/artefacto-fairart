import PDFDocument from 'pdfkit';
import { GeneradorPdf } from './GeneradorPdf.js';
import {
  PREAMBULO,
  CLAUSULA_1_DOCUMENTO,
  CIERRE_DOCUMENTO,
  DECLARACIONES_DOCUMENTO,
  clausulasConDescuento,
  formatearDescuento,
} from '../shared/acuerdo.js';
import { desglosar, formatoMXN } from '../shared/precios.js';

const COLOR_ROJO = '#B93232';
const COLOR_CREMA = '#E8DED0';
const COLOR_CREMA_PAPEL = '#FAF8F5';

const ETIQUETA_FISCAL = {
  cargada: 'Cargada',
  pendiente: 'Pendiente de entrega',
  tercero_sin_datos: 'Facturará un tercero — datos pendientes',
};

/**
 * Implementación de generador de PDF usando PDFKit
 * Vista PDF espejo del DocumentoAcuerdo.jsx del frontend
 * @extends {GeneradorPdf}
 */
export class PdfKitGenerador extends GeneradorPdf {
  /**
   * @param {import('./GeneradorPdf.js').DatosPdf} datos
   * @returns {Promise<Buffer>}
   */
  async generar(datos) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 40,
        bufferPages: true,
      });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        this._generarContenido(doc, datos);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @private
   * @param {PDFDocument} doc
   * @param {import('./GeneradorPdf.js').DatosPdf} datos
   */
  _generarContenido(doc, datos) {
    const a = datos.artista;
    const clausulas = clausulasConDescuento(datos.descuentoMax);

    // ══════════════════════════════════════════════════════════════
    // ENCABEZADO
    // ══════════════════════════════════════════════════════════════
    let y = doc.y;

    // Título principal
    doc
      .fontSize(18)
      .font('Helvetica-BoldOblique')
      .fillColor(COLOR_ROJO)
      .text('Acuerdo de', 50, y, { continued: false })
      .text('Consignación de Obra', 50, doc.y, { continued: false });

    // Info evento
    const infoY = y;
    const fechaFormateada = datos.fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Mexico_City'
    });

    // Línea 1: ARTE FACTO
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#444')
      .text('ARTE FACTO | Éticas Creativas — Segunda Edición', 350, infoY, {
        align: 'right',
        width: 195,
      });

    // Línea 2: Fecha con formato rico
    const lineaFechaY = doc.y;
    doc.fontSize(8.5).fillColor('#444');

    // Calcular el ancho de cada parte con su fuente correspondiente
    const anchoFecha1 = doc.font('Helvetica').widthOfString('Fecha: ');
    const anchoFecha2 = doc.font('Helvetica-Bold').widthOfString(fechaFormateada);
    const anchoFecha3 = doc.font('Helvetica').widthOfString(' · Lugar: Ciudad de México');
    const anchoTotalFecha = anchoFecha1 + anchoFecha2 + anchoFecha3;
    const xInicioFecha = 545 - anchoTotalFecha;

    doc.font('Helvetica').text('Fecha: ', xInicioFecha, lineaFechaY, { continued: true });
    doc.font('Helvetica-Bold').text(fechaFormateada, { continued: true });
    doc.font('Helvetica').text(' · Lugar: Ciudad de México');

    // Línea 3: Folio con negrita
    const lineaFolioY = doc.y;
    const anchoFolio1 = doc.font('Helvetica').widthOfString('Folio: ');
    const anchoFolio2 = doc.font('Helvetica-Bold').widthOfString(a.folio);
    const anchoTotalFolio = anchoFolio1 + anchoFolio2;
    const xInicioFolio = 545 - anchoTotalFolio;

    doc.font('Helvetica').text('Folio: ', xInicioFolio, lineaFolioY, { continued: true });
    doc.font('Helvetica-Bold').text(a.folio);

    // Línea horizontal roja
    y = doc.y + 10;
    doc.moveTo(50, y).lineTo(545, y).lineWidth(2).strokeColor(COLOR_ROJO).stroke();

    // Resetear posición para el preámbulo
    doc.y = y + 12;
    doc.x = 50;

    // ══════════════════════════════════════════════════════════════
    // PREÁMBULO
    // ══════════════════════════════════════════════════════════════
    // Dividir preámbulo en párrafos (respetando \n como en el HTML con whiteSpace: 'pre-line')
    const parrafosPreambulo = PREAMBULO.split('\n');
    doc.fontSize(9.5).font('Helvetica').fillColor('#111');

    parrafosPreambulo.forEach((parrafo, idx) => {
      doc.text(parrafo, 50, doc.y, {
        align: 'left',
        width: 495, // Ancho completo de la página (545 - 50)
        lineGap: 1.5,
      });
      if (idx < parrafosPreambulo.length - 1) {
        doc.moveDown(0.4);
      }
    });

    doc.moveDown(0.8);

    // ══════════════════════════════════════════════════════════════
    // DATOS DEL ARTISTA
    // ══════════════════════════════════════════════════════════════
    y = doc.y;
    doc.rect(50, y, 495, 35).fillAndStroke(COLOR_CREMA_PAPEL, COLOR_CREMA_PAPEL);

    doc.fontSize(9).font('Helvetica').fillColor('#111');
    const dataY = y + 8;
    doc.text(`Artista o colectivo: ${a.nombre}`, 60, dataY, { width: 475 });
    doc.text(`Folio de participación: ${a.folio}`, 60, dataY + 12, { width: 150 });
    doc.text(`Paquete: ${a.paquete}`, 215, dataY + 12, { width: 150 });
    doc.text(`Correo: ${a.correo}`, 60, dataY + 24, { width: 235 });
    doc.text(`Teléfono: ${a.telefono}`, 300, dataY + 24, { width: 150 });

    doc.y = y + 40;
    doc.moveDown(0.8);

    // ══════════════════════════════════════════════════════════════
    // CLÁUSULA 1 · OBRA EN CONSIGNACIÓN
    // ══════════════════════════════════════════════════════════════
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLOR_ROJO)
      .text('1 · Obra en consignación', 50, doc.y, { width: 495, align: 'left' });

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#111')
      .text(CLAUSULA_1_DOCUMENTO.intro, 50, doc.y, { width: 495, align: 'left', lineGap: 1.5 });

    doc.moveDown(0.5);

    // Tabla de obras
    this._generarTablaObras(doc, datos.obras, datos.ganancias);

    doc.moveDown(0.5);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`Descuento máximo autorizado: ${formatearDescuento(datos.descuentoMax)}`, 50, doc.y, {
        width: 495,
        continued: true,
      })
      .font('Helvetica')
      .text(' sobre el precio de venta.');

    doc.moveDown(0.3);
    doc.text(CLAUSULA_1_DOCUMENTO.estado, 50, doc.y, { width: 495, lineGap: 1.5 });
    doc.moveDown(0.3);

    // Dividir cierre en párrafos (tiene \n)
    const parrafosCierre = CLAUSULA_1_DOCUMENTO.cierre.split('\n');
    parrafosCierre.forEach((parrafo, idx) => {
      doc.text(parrafo, 50, doc.y, { width: 495, lineGap: 1.5 });
      if (idx < parrafosCierre.length - 1) {
        doc.moveDown(0.3);
      }
    });

    doc.moveDown(0.8);

    // ══════════════════════════════════════════════════════════════
    // CLÁUSULAS 2-8
    // ══════════════════════════════════════════════════════════════
    clausulas.slice(1).forEach(c => {
      // Verificar si necesitamos nueva página
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(COLOR_ROJO)
        .text(`${c.n} · ${c.titulo}`, 50, doc.y, { width: 495, continued: false });

      // Dividir texto legal en párrafos (respetando \n como en el HTML con whiteSpace: 'pre-line')
      const parrafosClausula = c.textoLegal.split('\n');
      doc.fontSize(9).font('Helvetica').fillColor('#222');

      parrafosClausula.forEach((parrafo, idx) => {
        doc.text(parrafo, 50, doc.y, {
          width: 495,
          align: 'left',
          lineGap: 1.5,
        });
        if (idx < parrafosClausula.length - 1) {
          doc.moveDown(0.3);
        }
      });

      doc.moveDown(0.7);
    });

    // ══════════════════════════════════════════════════════════════
    // CLÁUSULA 9 · ACEPTACIÓN DE RIESGO
    // ══════════════════════════════════════════════════════════════
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLOR_ROJO)
      .text('9 · Aceptación de riesgo', 50, doc.y, { width: 495, continued: false });

    doc.fontSize(9).font('Helvetica').fillColor('#111').text('El/la artista declara que:', 50, doc.y, { width: 495 });

    DECLARACIONES_DOCUMENTO.forEach(d => {
      doc.text(`— ${d}`, 50, doc.y, { width: 495, indent: 12, lineGap: 1 });
    });

    doc.moveDown(0.3);
    doc.text(CIERRE_DOCUMENTO, 50, doc.y, { width: 495, lineGap: 1.5 });

    doc.moveDown(1);

    // ══════════════════════════════════════════════════════════════
    // CONSTANCIA DE SITUACIÓN FISCAL
    // ══════════════════════════════════════════════════════════════
    if (doc.y > 680) {
      doc.addPage();
    }

    y = doc.y;
    doc.rect(50, y, 495, 20).fillAndStroke(COLOR_CREMA_PAPEL, COLOR_CREMA_PAPEL);

    const textoFiscal = datos.estadoFiscal
      ? ETIQUETA_FISCAL[datos.estadoFiscal] +
          (datos.constanciaNombre ? ` (${datos.constanciaNombre})` : '')
      : '—';

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLOR_ROJO)
      .text('Constancia de situación fiscal: ', 60, y + 7, { continued: true })
      .font('Helvetica')
      .fillColor('#111')
      .text(textoFiscal);

    doc.y = y + 25;
    doc.x = 50; // Resetear posición X
    doc.moveDown(0.8);

    // ══════════════════════════════════════════════════════════════
    // DATOS DE TRANSFERENCIA PARA EL PAGO DEL PAQUETE
    // ══════════════════════════════════════════════════════════════
    if (doc.y > 640) {
      doc.addPage();
    }

    y = doc.y;
    doc.rect(50, y, 495, 70).strokeColor(COLOR_ROJO).lineWidth(1.5).stroke();

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLOR_ROJO)
      .text('Datos de transferencia para el pago del paquete', 60, y + 8);

    doc.fontSize(8.5).font('Helvetica').fillColor('#111');
    let pagoY = y + 22;

    // Primera línea: Beneficiario y Banco
    doc.text(`Beneficiario: ${datos.datosPago.beneficiario}`, 60, pagoY, { width: 230, continued: false });
    const beneficiarioHeight = doc.heightOfString(`Beneficiario: ${datos.datosPago.beneficiario}`, { width: 230 });
    doc.text(`Banco: ${datos.datosPago.banco}`, 300, pagoY, { width: 150, continued: false });

    // Segunda línea: CLABE y Cuenta (ajustar Y según la altura del beneficiario)
    pagoY += Math.max(beneficiarioHeight, 10);
    doc.text(`CLABE: ${datos.datosPago.clabe}`, 60, pagoY, { width: 230, continued: false });
    doc.text(`Cuenta: ${datos.datosPago.cuenta}`, 300, pagoY, { width: 150, continued: false });

    // Tercera línea: Concepto
    pagoY += 10;
    doc.text(`Concepto: ${datos.datosPago.concepto}`, 60, pagoY, { width: 475, continued: false });

    // Ajustar altura del cuadro y posición Y final
    const cuadroHeight = pagoY - y + 15; // Altura dinámica del contenido + padding
    doc.y = y + cuadroHeight;
    doc.x = 50; // Resetear posición X
    doc.moveDown(1.5);

    // ══════════════════════════════════════════════════════════════
    // FIRMAS DE CONFORMIDAD
    // ══════════════════════════════════════════════════════════════
    if (doc.y > 600) {
      doc.addPage();
    }

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111').text('Firmas de conformidad', 50, doc.y, { width: 495 });

    doc.moveDown(1);

    const firmaY = doc.y;

    // Firma del artista
    if (datos.firmaArtistaPng && !datos.borrador) {
      try {
        doc.image(datos.firmaArtistaPng, 80, firmaY, { width: 180, height: 80, fit: [180, 80] });
      } catch (e) {
        console.error('Error al incluir firma del artista en PDF:', e.message);
      }
    }

    const firmaArtistaBorderY = firmaY + 85;
    doc.moveTo(70, firmaArtistaBorderY).lineTo(270, firmaArtistaBorderY).lineWidth(1).stroke();
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor('#111')
      .text(a.nombre, 70, firmaArtistaBorderY + 5, { width: 200, align: 'center' });
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .text('Firma del/la artista', 70, firmaArtistaBorderY + 17, { width: 200, align: 'center' });

    // Firma de la dirección
    if (datos.firmaDireccionPng) {
      try {
        doc.image(datos.firmaDireccionPng, 325, firmaY, {
          width: 180,
          height: 80,
          fit: [180, 80],
        });
      } catch (e) {
        console.error('Error al incluir firma de dirección en PDF:', e.message);
      }
    }

    const firmaDireccionBorderY = firmaY + 85;
    doc
      .moveTo(315, firmaDireccionBorderY)
      .lineTo(515, firmaDireccionBorderY)
      .lineWidth(1)
      .stroke();
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor('#111')
      .text('Benito García Prieto Pérez', 315, firmaDireccionBorderY + 5, {
        width: 200,
        align: 'center',
      });
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .text('Dirección de ARTE FACTO', 315, firmaDireccionBorderY + 17, {
        width: 200,
        align: 'center',
      });
  }

  /**
   * Genera la tabla de obras con desglose completo
   * @private
   * @param {PDFDocument} doc
   * @param {any[]} obras
   * @param {Record<string, number>} ganancias
   */
  _generarTablaObras(doc, obras, ganancias) {
    const tableTop = doc.y;
    const colWidths = [140, 100, 90, 75, 90];
    const colPositions = [50];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colPositions.push(colPositions[i] + colWidths[i]);
    }

    // Encabezados
    doc
      .fontSize(8)
      .font('Helvetica-BoldOblique')
      .fillColor(COLOR_CREMA)
      .rect(50, tableTop, 495, 16)
      .fillAndStroke(COLOR_ROJO, COLOR_ROJO);

    const headers = ['Título', 'Técnica y año', 'Medida (con marco)', 'Precio de venta', 'Precio público con IVA'];
    headers.forEach((header, i) => {
      const align = i >= 3 ? 'right' : 'left';
      doc.text(header, colPositions[i] + 4, tableTop + 5, {
        width: colWidths[i] - 8,
        align,
      });
    });

    let y = tableTop + 16;

    // Filas de obras
    obras.forEach((o, idx) => {
      const ganancia = ganancias?.[o.obraId] ?? o.gananciaOriginal;
      const d = desglosar(ganancia);

      // Verificar si necesitamos nueva página
      if (y > 680) {
        doc.addPage();
        y = 50;
      }

      // Fondo alternado
      if (idx % 2 === 0) {
        doc.rect(50, y, 495, 18).fillAndStroke('#FAFAFA', '#EEE');
      } else {
        doc.rect(50, y, 495, 18).stroke('#EEE');
      }

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#111');
      doc.text(o.titulo, colPositions[0] + 4, y + 5, { width: colWidths[0] - 8 });

      doc.font('Helvetica');
      doc.text(o.tecnica, colPositions[1] + 4, y + 5, { width: colWidths[1] - 8 });
      doc.text(o.medida, colPositions[2] + 4, y + 5, { width: colWidths[2] - 8 });
      doc.text(formatoMXN(d.precioVenta), colPositions[3] + 4, y + 5, {
        width: colWidths[3] - 8,
        align: 'right',
      });
      doc.font('Helvetica-Bold').text(formatoMXN(d.precioPublico), colPositions[4] + 4, y + 5, {
        width: colWidths[4] - 8,
        align: 'right',
      });

      y += 18;
    });

    doc.y = y + 5;
    doc.x = 50; // Resetear posición X para el texto que sigue
  }
}
