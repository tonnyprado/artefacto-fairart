import PDFDocument from 'pdfkit';
import { GeneradorPdf } from './GeneradorPdf.js';
import { clausulasConDescuento } from '../shared/acuerdo.js';
import { formatoMXN } from '../shared/precios.js';

/**
 * Implementación de generador de PDF usando PDFKit
 * @extends {GeneradorPdf}
 */
export class PdfKitGenerador extends GeneradorPdf {
  /**
   * @param {import('./GeneradorPdf.js').DatosPdf} datos
   * @returns {Promise<Buffer>}
   */
  async generar(datos) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
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
    // Encabezado
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('ACUERDO DE CONSIGNACIÓN', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text('ARTE FACTO', { align: 'center' });

    if (datos.borrador) {
      doc
        .fontSize(10)
        .fillColor('red')
        .text('BORRADOR - VISTA PREVIA', { align: 'center' })
        .fillColor('black');
    }

    doc.moveDown(1);

    // Datos del artista
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Datos del Artista', { underline: true });

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    const datosArtista = [
      `Nombre: ${datos.artista.nombre}`,
      `Folio: ${datos.artista.folio}`,
      `Email: ${datos.artista.correo}`,
      `Teléfono: ${datos.artista.telefono || 'No proporcionado'}`,
      `RFC: ${datos.artista.rfc || 'No proporcionado'}`,
      `Paquete: ${datos.artista.paquete}`,
    ];

    datosArtista.forEach(linea => {
      doc.text(linea);
    });

    doc.moveDown(1);

    // Estado fiscal
    doc.fontSize(14).font('Helvetica-Bold').text('Situación Fiscal', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    const estadoTexto = {
      pendiente: 'Sin constancia fiscal',
      cargada: `Constancia cargada: ${datos.constanciaNombre || 'sin nombre'}`,
      verificada: 'Constancia verificada',
    };

    doc.text(estadoTexto[datos.estadoFiscal] || 'Estado desconocido');
    doc.moveDown(1);

    // Cláusulas del acuerdo
    doc.fontSize(14).font('Helvetica-Bold').text('Términos del Acuerdo', { underline: true });
    doc.moveDown(0.5);

    const clausulas = clausulasConDescuento(datos.descuentoMax);
    doc.fontSize(9).font('Helvetica');

    clausulas.forEach((clausula, index) => {
      doc
        .font('Helvetica-Bold')
        .text(`${index + 1}. ${clausula.titulo}`, { continued: false });

      doc.font('Helvetica').text(clausula.texto, {
        align: 'justify',
        indent: 20,
      });

      doc.moveDown(0.5);
    });

    // Nueva página para obras
    doc.addPage();

    // Obras consignadas
    doc.fontSize(14).font('Helvetica-Bold').text('Obras Consignadas', { underline: true });
    doc.moveDown(0.5);

    if (datos.obras.length === 0) {
      doc.fontSize(10).font('Helvetica').text('No hay obras incluidas en este acuerdo.');
    } else {
      // Tabla de obras
      const columnWidths = [30, 150, 120, 80, 90];
      const startX = 50;
      let y = doc.y;

      // Encabezados de tabla
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('#', startX, y, { width: columnWidths[0], continued: true });
      doc.text('Título', startX + columnWidths[0], y, {
        width: columnWidths[1],
        continued: true,
      });
      doc.text('Técnica/Medida', startX + columnWidths[0] + columnWidths[1], y, {
        width: columnWidths[2],
        continued: true,
      });
      doc.text('Ganancia', startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y, {
        width: columnWidths[3],
        continued: true,
      });
      doc.text(
        'Precio Público',
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
        y,
        { width: columnWidths[4] }
      );

      y += 20;
      doc.moveTo(startX, y).lineTo(startX + 520, y).stroke();
      y += 5;

      // Contenido de tabla
      doc.font('Helvetica');
      datos.obras.forEach((obra, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(`${index + 1}`, startX, y, { width: columnWidths[0] });
        doc.text(obra.titulo, startX + columnWidths[0], y, { width: columnWidths[1] });
        doc.text(
          `${obra.tecnica}\n${obra.medida}`,
          startX + columnWidths[0] + columnWidths[1],
          y,
          { width: columnWidths[2] }
        );
        doc.text(
          formatoMXN(obra.desglose.ganancia),
          startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
          y,
          { width: columnWidths[3] }
        );
        doc.text(
          formatoMXN(obra.desglose.precioPublico),
          startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
          y,
          { width: columnWidths[4] }
        );

        y += 40;
      });

      // Totales
      y += 10;
      doc.moveTo(startX, y).lineTo(startX + 520, y).stroke();
      y += 10;

      const totalGanancia = datos.obras.reduce((sum, o) => sum + o.desglose.ganancia, 0);
      const totalPublico = datos.obras.reduce((sum, o) => sum + o.desglose.precioPublico, 0);

      doc
        .font('Helvetica-Bold')
        .text('TOTALES:', startX + columnWidths[0] + columnWidths[1], y);
      doc.text(formatoMXN(totalGanancia), startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y);
      doc.text(
        formatoMXN(totalPublico),
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
        y
      );
    }

    // Nueva página para firmas y datos de pago
    doc.addPage();

    // Datos de pago
    doc.fontSize(14).font('Helvetica-Bold').text('Datos de Pago', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    const datosPago = [
      `Beneficiario: ${datos.datosPago.beneficiario}`,
      `Banco: ${datos.datosPago.banco}`,
      `CLABE: ${datos.datosPago.clabe}`,
      `Cuenta: ${datos.datosPago.cuenta}`,
      `Concepto: ${datos.datosPago.concepto}`,
      `Plazos: ${datos.datosPago.plazos}`,
    ];

    datosPago.forEach(linea => {
      doc.text(linea);
    });

    doc.moveDown(2);

    // Firmas
    doc.fontSize(12).font('Helvetica-Bold').text('Firmas', { underline: true });
    doc.moveDown(1);

    const firmaY = doc.y;

    // Firma del artista
    doc.fontSize(10).font('Helvetica');
    if (datos.firmaArtistaPng && !datos.borrador) {
      doc.image(datos.firmaArtistaPng, 70, firmaY, { width: 150, height: 60 });
    }
    doc.text('_'.repeat(30), 50, firmaY + 70);
    doc.text(datos.artista.nombre, 50, firmaY + 85, { align: 'center', width: 200 });
    doc.text('Artista', 50, firmaY + 100, { align: 'center', width: 200 });

    // Firma de la dirección
    if (datos.firmaDireccionPng) {
      doc.image(datos.firmaDireccionPng, 350, firmaY, { width: 150, height: 60 });
    }
    doc.text('_'.repeat(30), 330, firmaY + 70);
    doc.text('ARTE FACTO', 330, firmaY + 85, { align: 'center', width: 200 });
    doc.text('Dirección', 330, firmaY + 100, { align: 'center', width: 200 });

    // Fecha
    doc.moveDown(4);
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`Fecha: ${datos.fecha.toLocaleDateString('es-MX')}`, { align: 'right' });

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('Este documento es legalmente vinculante.', 50, 720, { align: 'center' });
  }
}
