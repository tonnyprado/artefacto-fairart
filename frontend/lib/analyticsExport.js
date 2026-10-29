/**
 * Analytics Export Service
 * Servicio para exportar reportes de analytics en PDF y Excel
 * Para uso del equipo de marketing
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { EVENTS_CATALOG, EVENT_CATEGORIES } from './eventsCatalog'

/**
 * Exportar reporte completo a PDF
 * @param {Object} data - Datos de analytics
 * @param {string} dateRange - Rango de fechas del reporte
 */
export function exportToPDF(data, dateRange = '30 días') {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // ==========================================
  // PORTADA
  // ==========================================
  doc.setFontSize(24)
  doc.setTextColor(184, 48, 48) // Red ARTEFACTO
  doc.text('ARTEFACTO', pageWidth / 2, 30, { align: 'center' })

  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text('Reporte de Analytics', pageWidth / 2, 45, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Período: Últimos ${dateRange}`, pageWidth / 2, 55, { align: 'center' })
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 62, { align: 'center' })

  // ==========================================
  // RESUMEN EJECUTIVO
  // ==========================================
  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Resumen Ejecutivo', 14, 85)

  const stats = data.stats || {}

  doc.autoTable({
    startY: 92,
    head: [['Métrica', 'Valor', 'Detalle']],
    body: [
      ['Sesiones Totales', (stats.total_sessions || 0).toLocaleString(), `${stats.unique_users || 0} usuarios únicos`],
      ['Páginas Vistas', (stats.total_page_views || 0).toLocaleString(), `${((stats.total_page_views || 0) / (stats.total_sessions || 1)).toFixed(1)} por sesión`],
      ['Conversiones', (stats.total_conversions || 0).toLocaleString(), `${data.conversionMetrics?.conversion_rate || 0}% tasa de conversión`],
      ['Tiempo Promedio', `${Math.round(stats.avg_time_on_page_seconds || 0)}s`, 'Por página vista'],
      ['Total Clicks', (stats.total_clicks || 0).toLocaleString(), 'En elementos rastreados'],
      ['Errores Detectados', (stats.total_errors || 0).toLocaleString(), 'Requieren atención técnica']
    ],
    headStyles: { fillColor: [184, 48, 48], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 }
  })

  // ==========================================
  // PÁGINAS MÁS VISITADAS
  // ==========================================
  doc.addPage()
  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Páginas Más Visitadas', 14, 20)

  const topPages = (data.topPages || []).slice(0, 10)

  doc.autoTable({
    startY: 27,
    head: [['#', 'Página', 'Vistas', 'Sesiones Únicas']],
    body: topPages.map((page, index) => [
      index + 1,
      page.page_title || 'Sin título',
      page.views?.toLocaleString() || 0,
      page.unique_sessions?.toLocaleString() || 0
    ]),
    headStyles: { fillColor: [184, 48, 48], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 }
  })

  // ==========================================
  // FUNNEL DE CONVERSIÓN
  // ==========================================
  const startY = doc.lastAutoTable.finalY + 15

  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Funnel de Conversión - Registro', 14, startY)

  const funnelData = data.funnelData || []

  if (funnelData.length > 0) {
    doc.autoTable({
      startY: startY + 7,
      head: [['Paso', 'Sesiones', 'Tasa de Abandono']],
      body: funnelData.map((step, index) => {
        const nextStep = funnelData[index + 1]
        const dropRate = nextStep
          ? (((step.sessions - nextStep.sessions) / step.sessions) * 100).toFixed(1)
          : '0'
        return [
          step.event_name || `Paso ${index + 1}`,
          step.sessions?.toLocaleString() || 0,
          `${dropRate}%`
        ]
      }),
      headStyles: { fillColor: [184, 48, 48], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    })
  }

  // ==========================================
  // DISTRIBUCIÓN DE EVENTOS
  // ==========================================
  doc.addPage()
  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Distribución de Eventos', 14, 20)

  const distributionData = data.distributionData || []

  doc.autoTable({
    startY: 27,
    head: [['Tipo de Evento', 'Cantidad', 'Porcentaje']],
    body: distributionData.map((event) => [
      event.event_type,
      event.count?.toLocaleString() || 0,
      `${event.percentage || 0}%`
    ]),
    headStyles: { fillColor: [184, 48, 48], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 }
  })

  // ==========================================
  // CATÁLOGO DE EVENTOS (Para Marketing)
  // ==========================================
  doc.addPage()
  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Catálogo de Eventos - Guía para Marketing', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('Esta sección explica cada tipo de evento y su uso para marketing:', 14, 28)

  // Eventos de conversión (los más importantes)
  const conversionEvents = Object.entries(EVENTS_CATALOG)
    .filter(([_, info]) => info.category === EVENT_CATEGORIES.CONVERSION)
    .map(([type, info]) => [
      type,
      info.name,
      info.meta_pixel || 'N/A',
      info.value
    ])

  doc.autoTable({
    startY: 35,
    head: [['Evento', 'Nombre', 'Meta Pixel', 'Valor']],
    body: conversionEvents,
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }, // Green
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 }
  })

  // Eventos de formularios
  const formEvents = Object.entries(EVENTS_CATALOG)
    .filter(([_, info]) => info.category === EVENT_CATEGORIES.FORM)
    .map(([type, info]) => [
      type,
      info.name,
      info.meta_pixel || 'N/A',
      info.value
    ])

  const startY2 = doc.lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.setTextColor(184, 48, 48)
  doc.text('Eventos de Formularios', 14, startY2)

  doc.autoTable({
    startY: startY2 + 5,
    head: [['Evento', 'Nombre', 'Meta Pixel', 'Valor']],
    body: formEvents,
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }, // Blue
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 }
  })

  // ==========================================
  // RECOMENDACIONES PARA MARKETING
  // ==========================================
  doc.addPage()
  doc.setFontSize(16)
  doc.setTextColor(184, 48, 48)
  doc.text('Recomendaciones para Marketing', 14, 20)

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)

  const recommendations = [
    {
      title: '1. Optimización de Meta Pixel',
      items: [
        'Los eventos de conversión se envían automáticamente a Meta Pixel',
        'Usa "registro_complete" para crear Custom Audiences de artistas registrados',
        'Usa "form_abandon" para remarketing de usuarios que no completaron'
      ]
    },
    {
      title: '2. Análisis del Funnel',
      items: [
        `Tasa de conversión actual: ${data.conversionMetrics?.conversion_rate || 0}%`,
        'Identifica el paso con mayor abandono y optimízalo',
        'A/B testing en pasos críticos del formulario'
      ]
    },
    {
      title: '3. Segmentación de Audiencias',
      items: [
        'Crea Custom Audiences por tipo de paquete seleccionado',
        'Segmenta por categoría artística (pintura, escultura, etc.)',
        'Remarketing específico según página visitada'
      ]
    },
    {
      title: '4. Optimización de Conversión',
      items: [
        `Páginas con mayor tráfico: ${topPages[0]?.page_title || 'N/A'}`,
        'Optimiza CTAs en páginas con bajo tiempo de permanencia',
        `Reduce errores (${stats.total_errors || 0} detectados) para mejorar UX`
      ]
    }
  ]

  let yPos = 30
  recommendations.forEach((rec) => {
    doc.setFontSize(12)
    doc.setTextColor(184, 48, 48)
    doc.text(rec.title, 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    rec.items.forEach((item) => {
      doc.text(`• ${item}`, 20, yPos)
      yPos += 6
    })
    yPos += 5
  })

  // ==========================================
  // PIE DE PÁGINA
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Reporte Analytics ARTEFACTO - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Guardar PDF
  const filename = `ARTEFACTO_Analytics_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Exportar datos a Excel
 * @param {Object} data - Datos de analytics
 * @param {string} dateRange - Rango de fechas del reporte
 */
export function exportToExcel(data, dateRange = '30 días') {
  const workbook = XLSX.utils.book_new()

  // ==========================================
  // HOJA 1: RESUMEN
  // ==========================================
  const stats = data.stats || {}
  const summaryData = [
    ['REPORTE DE ANALYTICS - ARTEFACTO'],
    [`Período: Últimos ${dateRange}`],
    [`Generado: ${new Date().toLocaleString('es-MX')}`],
    [],
    ['Métrica', 'Valor', 'Detalle'],
    ['Sesiones Totales', stats.total_sessions || 0, `${stats.unique_users || 0} usuarios únicos`],
    ['Páginas Vistas', stats.total_page_views || 0, `${((stats.total_page_views || 0) / (stats.total_sessions || 1)).toFixed(1)} por sesión`],
    ['Conversiones', stats.total_conversions || 0, `${data.conversionMetrics?.conversion_rate || 0}% tasa`],
    ['Tiempo Promedio', `${Math.round(stats.avg_time_on_page_seconds || 0)}s`, 'Por página'],
    ['Total Clicks', stats.total_clicks || 0, 'Elementos rastreados'],
    ['Errores', stats.total_errors || 0, 'Requieren atención'],
    ['Eventos Totales', stats.total_events || 0, 'Todos los tipos']
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

  // ==========================================
  // HOJA 2: TOP PÁGINAS
  // ==========================================
  const topPages = data.topPages || []
  const pagesData = [
    ['Páginas Más Visitadas'],
    [],
    ['#', 'Título', 'URL', 'Vistas', 'Sesiones Únicas'],
    ...topPages.map((page, index) => [
      index + 1,
      page.page_title || 'Sin título',
      page.page_url,
      page.views || 0,
      page.unique_sessions || 0
    ])
  ]

  const pagesSheet = XLSX.utils.aoa_to_sheet(pagesData)
  XLSX.utils.book_append_sheet(workbook, pagesSheet, 'Top Páginas')

  // ==========================================
  // HOJA 3: FUNNEL DE CONVERSIÓN
  // ==========================================
  const funnelData = data.funnelData || []
  const funnelSheetData = [
    ['Funnel de Conversión - Registro'],
    [],
    ['Paso', 'Evento', 'Sesiones', 'Tasa Abandono'],
    ...funnelData.map((step, index) => {
      const nextStep = funnelData[index + 1]
      const dropRate = nextStep
        ? (((step.sessions - nextStep.sessions) / step.sessions) * 100).toFixed(1)
        : '0'
      return [
        index + 1,
        step.event_name || `Paso ${index + 1}`,
        step.sessions || 0,
        `${dropRate}%`
      ]
    })
  ]

  const funnelSheet = XLSX.utils.aoa_to_sheet(funnelSheetData)
  XLSX.utils.book_append_sheet(workbook, funnelSheet, 'Funnel')

  // ==========================================
  // HOJA 4: DISTRIBUCIÓN DE EVENTOS
  // ==========================================
  const distributionData = data.distributionData || []
  const distributionSheetData = [
    ['Distribución de Eventos'],
    [],
    ['Tipo de Evento', 'Cantidad', 'Porcentaje'],
    ...distributionData.map((event) => [
      event.event_type,
      event.count || 0,
      `${event.percentage || 0}%`
    ])
  ]

  const distributionSheet = XLSX.utils.aoa_to_sheet(distributionSheetData)
  XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Distribución')

  // ==========================================
  // HOJA 5: CATÁLOGO DE EVENTOS (Para Marketing)
  // ==========================================
  const catalogData = [
    ['CATÁLOGO DE EVENTOS - GUÍA PARA MARKETING'],
    [],
    ['Tipo', 'Nombre', 'Categoría', 'Meta Pixel', 'Valor', 'Uso Marketing'],
    ...Object.entries(EVENTS_CATALOG).map(([type, info]) => [
      type,
      info.name,
      info.category,
      info.meta_pixel || 'N/A',
      info.value,
      info.marketing_use
    ])
  ]

  const catalogSheet = XLSX.utils.aoa_to_sheet(catalogData)
  XLSX.utils.book_append_sheet(workbook, catalogSheet, 'Catálogo de Eventos')

  // Guardar Excel
  const filename = `ARTEFACTO_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, filename)
}

/**
 * Exportar datos a CSV (simple)
 * @param {Object} data - Datos de analytics
 */
export function exportToCSV(data) {
  const stats = data.stats || {}

  const csvData = [
    ['Métrica', 'Valor'],
    ['Sesiones Totales', stats.total_sessions || 0],
    ['Usuarios Únicos', stats.unique_users || 0],
    ['Páginas Vistas', stats.total_page_views || 0],
    ['Conversiones', stats.total_conversions || 0],
    ['Tasa de Conversión', `${data.conversionMetrics?.conversion_rate || 0}%`],
    ['Tiempo Promedio (s)', Math.round(stats.avg_time_on_page_seconds || 0)],
    ['Total Clicks', stats.total_clicks || 0],
    ['Errores', stats.total_errors || 0],
    ['Eventos Totales', stats.total_events || 0]
  ]

  const csvContent = csvData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `ARTEFACTO_Analytics_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
