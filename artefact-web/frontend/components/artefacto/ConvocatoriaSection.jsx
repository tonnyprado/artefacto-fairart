'use client';
import Link from 'next/link';
import { COLORS, FONTS, container } from './theme';

const FASES_DATA = [
  {
    num: 'I',
    title: 'Fase 1',
    descuento2D: '-35%',
    descuento3D: '-25%',
    fechas: { apertura: 'Fecha por definir', cierre: 'Fecha por definir' }
  },
  {
    num: 'II',
    title: 'Fase 2',
    descuento2D: '-20%',
    descuento3D: '-15%',
    fechas: { apertura: 'Fecha por definir', cierre: 'Fecha por definir' }
  },
  {
    num: 'III',
    title: 'Fase 3',
    descuento2D: 'Precio completo',
    descuento3D: 'Precio completo',
    fechas: { apertura: 'Fecha por definir', cierre: 'Fecha por definir' }
  },
];

const PAQUETES_2D = [
  { tipo: 'Básico', metrosLineales: 2, fase1: '6,500', fase2: '8,000', fase3: '10,000' },
  { tipo: 'Estándar', metrosLineales: 3, fase1: '8,775', fase2: '10,800', fase3: '13,500' },
  { tipo: 'Medio', metrosLineales: 5, fase1: '13,000', fase2: '16,000', fase3: '20,000' },
  { tipo: 'Amplio', metrosLineales: 7, fase1: '16,250', fase2: '20,000', fase3: '25,000' },
  { tipo: 'Completo', metrosLineales: 10, fase1: '22,750', fase2: '28,000', fase3: '35,000' },
];

const PAQUETES_3D = [
  { tipo: 'Básico', metrosCuadrados: 1, fase1: '3,375', fase2: '3,825', fase3: '4,500' },
  { tipo: 'Estándar', metrosCuadrados: 2, fase1: '6,000', fase2: '6,800', fase3: '8,000' },
  { tipo: 'Medio', metrosCuadrados: 3, fase1: '8,250', fase2: '9,350', fase3: '11,000' },
  { tipo: 'Amplio', metrosCuadrados: 4, fase1: '10,500', fase2: '11,900', fase3: '14,000' },
];

const POSTULACION_ITEMS = [
  'Podrán participar artistas mayores de 18 años, emergentes o consolidados, con o sin estudios en artes visuales.',
  'Ser de nacionalidad mexicana o extranjera. No es necesario residir en México. Abrimos las puertas a escenas internacionales.',
  'La postulación puede ser individual o colectiva; en este último caso deberá nombrarse un/a representante.',
  'Llenar el formulario de inscripción con toda la documentación requerida antes del cierre de convocatoria.',
  'Cada artista o colectivo podrá postular en varias disciplinas, sin mínimo de obras, según el paquete adquirido.'
];

const REGISTRO_ITEMS = [
  'Completar el Formulario de Inscripción disponible en arte-facto.com/convocatoria',
  'La convocatoria se despliega en 3 Fases de selección. Cada fase tendrá su apertura y cierre, publicadas en esta convocatoria y arte-facto.com/calendario',
  'Según la fase de registro, se ofrecerán descuentos en los paquetes disponibles para los artistas seleccionados.',
  'Adjuntar en el formulario los documentos e imágenes solicitadas respetando los formatos, nomenclaturas & pesos de archivos permitidos.',
  'Si no completas el registro dentro de una fase, siempre podrás aplicar en las fases consecuentes. Al aplicar y no quedar, seguirás considerado en fases posteriores.'
];

const MEDIOS_TECNICAS = ['Pintura', 'Acuarela', 'Dibujo', 'Collage & Mixta', 'Gráfica', 'Fotografía', 'Cerámica', 'Escultura', 'Textil'];

const FECHAS_IMPORTANTES = [
  { hito: 'Apertura de convocatoria', fecha: '1 de agosto de 2026' },
  { hito: 'Fase 1 — apertura', fecha: 'Fecha por definir' },
  { hito: 'Fase 1 — cierre', fecha: 'Fecha por definir' },
  { hito: 'Publicación de resultados (Fase 1)', fecha: 'Fecha por definir' },
  { hito: 'Fase 2 — apertura', fecha: 'Fecha por definir' },
  { hito: 'Fase 2 — cierre', fecha: 'Fecha por definir' },
  { hito: 'Publicación de resultados (Fase 2)', fecha: 'Fecha por definir' },
  { hito: 'Fase 3 — apertura', fecha: 'Fecha por definir' },
  { hito: 'Fase 3 — cierre', fecha: 'Fecha por definir' },
  { hito: 'Publicación de resultados (Fase 3)', fecha: 'Fecha por definir' },
  { hito: 'Bootcamp Cerámica', fecha: 'Fecha por definir' },
  { hito: 'Recepción de obra', fecha: '1 y 2 de febrero de 2027' },
  { hito: 'ARTE FACTO | Éticas creativas — La feria', fecha: '4, 5, 6, 7 de febrero de 2027' },
  { hito: 'Desmontaje y devolución de obra', fecha: '8 de febrero de 2027' },
  { hito: 'Periodo de pagos a artistas y venta post-evento', fecha: '10 de febrero de 2027 hasta 10 de marzo 2027' },
];

const btn = (bg, color) => ({
  background: bg,
  color,
  padding: '18px 32px',
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  display: 'inline-block',
  transition: 'all 0.2s ease'
});

export default function ConvocatoriaSection({ edicion = '2027', abierta = true, urlRegistro = '/registro' }) {
  const sectionTitle = (title, mt = 80) => ({
    margin: `${mt}px 0 24px`,
    fontFamily: FONTS.display,
    fontWeight: FONTS.displayWeight,
    fontStyle: FONTS.displayStyle,
    fontSize: 32,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: COLORS.cream,
  });

  const subsectionTitle = (mt = 40) => ({
    margin: `${mt}px 0 16px`,
    fontFamily: FONTS.subtitle,
    fontWeight: FONTS.subtitleWeight,
    fontStyle: FONTS.subtitleStyle,
    fontSize: 22,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: COLORS.cream,
  });

  const bodyText = (mt = 0) => ({
    margin: `${mt}px 0 0`,
    fontSize: 16,
    lineHeight: 1.7,
    color: 'rgba(244,237,228,0.9)',
  });

  return (
    <>
      {/* PANTALLA INICIAL FULLSCREEN */}
      <section
        id="convocatoria"
        style={{
          scrollMarginTop: 0,
          minHeight: '100vh',
          background: COLORS.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative'
        }}
      >
        <h1 style={{
          margin: 0,
          fontFamily: FONTS.display,
          fontWeight: FONTS.displayWeight,
          fontStyle: FONTS.displayStyle,
          fontSize: 'clamp(48px, 10vw, 120px)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: COLORS.cream,
          textAlign: 'center',
          lineHeight: 1
        }}>
          Convocatoria
        </h1>

        {/* Indicador de scroll */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animation: 'bounce 2s infinite'
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            fontFamily: FONTS.body
          }}>
            Scroll
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.cream}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </section>

      {/* CONTENIDO DE LA CONVOCATORIA */}
      <section style={{ background: COLORS.red, color: COLORS.cream, padding: '120px 24px 120px' }}>
      <div style={{ ...container, maxWidth: 1200 }}>

        {/* INTRO */}
        <p style={{ ...bodyText(32), fontSize: 20, maxWidth: 900 }}>
          A partir del 1 de agosto de 2026, <strong>ARTE FACTO | Éticas Creativas</strong> abre sus puertas e invita a artistas mexicanos e internacionales a participar en la convocatoria abierta para <strong>ARTE FACTO | La feria</strong>, que se llevará a cabo del 4-7 de febrero de 2027, durante la semana del arte en Ciudad de México.
        </p>

        <p style={{ ...bodyText(20), maxWidth: 900 }}>
          A lo largo de las 3 fases de la convocatoria y un proceso de selección, estaremos muy emocionados de conocer las propuestas de artistas —desde emergentes a consolidados— quienes ahonden su práctica artística bajo enfoques de las artes visuales tradicionales y contemporáneas.
        </p>

        {/* LAS BASES */}
        <h2 style={sectionTitle('Las Bases')}>Las Bases</h2>

        <h3 style={subsectionTitle(32)}>Postulación</h3>
        <ul style={{ margin: '16px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POSTULACION_ITEMS.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.7, color: 'rgba(244,237,228,0.9)' }}>
              <span style={{ color: COLORS.cream, fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 style={subsectionTitle(40)}>Registro</h3>
        <ul style={{ margin: '16px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REGISTRO_ITEMS.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.7, color: 'rgba(244,237,228,0.9)' }}>
              <span style={{ color: COLORS.cream, fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* FASES */}
        <h2 style={sectionTitle('Fases')}>Fases</h2>

        <h3 style={subsectionTitle(32)}>Dinámica</h3>
        <p style={bodyText(16)}>
          La convocatoria abierta de ARTE FACTO comienza en agosto y tendrá término en noviembre. Durante este periodo, la convocatoria se distribuirá en 3 fases de misma duración, durante las cuales lxs artistxs de las disciplinas aceptadas podrán postular su obra.
        </p>
        <p style={bodyText(16)}>
          Cada fase tendrá una fecha de inicio y término, las cuales serán anunciadas en la presente convocatoria al igual que en las redes de ARTE FACTO y arte-facto.com/calendario. Una vez postuladx, el artista será considerado durante la fase en curso, así como también en las fases subsecuentes (en caso que el/la artista no sea seleccionadx durante la fase en la que se postuló inicialmente).
        </p>

        <h3 style={subsectionTitle(40)}>Cronograma y Fechas</h3>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FASES_DATA.map((fase) => (
            <div key={fase.num} style={{ background: 'rgba(0,0,0,0.2)', padding: 24, border: `2px solid ${COLORS.black}` }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 48, lineHeight: 1, color: COLORS.cream, marginBottom: 12 }}>{fase.num}</div>
              <h4 style={{ margin: '0 0 16px', fontFamily: FONTS.subtitle, fontSize: 20, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.cream }}>{fase.title}</h4>
              <p style={{ margin: '8px 0', fontSize: 14, color: 'rgba(244,237,228,0.85)' }}>
                <strong>2D:</strong> {fase.descuento2D} | <strong>3D:</strong> {fase.descuento3D}
              </p>
              <p style={{ margin: '12px 0 4px', fontSize: 13, color: 'rgba(244,237,228,0.7)' }}>
                <strong>Apertura:</strong> {fase.fechas.apertura}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(244,237,228,0.7)' }}>
                <strong>Cierre:</strong> {fase.fechas.cierre}
              </p>
            </div>
          ))}
        </div>

        <p style={{ ...bodyText(24), fontSize: 14, fontStyle: 'italic' }}>
          La convocatoria en fases se desarrolla escalonada con el objetivo de desarrollar un proyecto curatorial robusto y habilitar la posibilidad de participar a una mayor cantidad de artistas, reconociendo el interés en tener espacios de exposición durante la Semana del Arte, dentro de proyectos sólidos y de calidad.
        </p>

        <h3 style={subsectionTitle(40)}>Concurso</h3>
        <p style={bodyText(16)}>
          Con el objetivo de promover e incentivar la participación de más artistas, <strong>ARTE FACTO | La feria</strong> ofrecerá ± 10 metros lineales que serán concursados a 5 artistas para que exhiban su obra pictórica. Automáticamente al postularse en cualquiera de las fases, lxs artistas serán considerados automáticamente como concursantes.
        </p>
        <p style={bodyText(12)}>
          La fecha de publicación de los resultados será el lunes 16 de noviembre de 2026. Al momento de la publicación de los resultados, las piezas postuladas y seleccionadas deberán estar disponibles.
        </p>

        {/* BOOTCAMP */}
        <h2 style={sectionTitle('Bootcamp Cerámica')}>Bootcamp Cerámica</h2>
        <p style={bodyText(24)}>
          Una vez seleccionados lxs artistas y firmando la hoja de consigna, el equipo de coordinación de ARTE FACTO les invita a un bootcamp de cerámica en Ciudad de México, hacia finales del mes de Noviembre (fecha y ubicación aún por definir). <em>Gastos de transporte y hospedaje son responsabilidad del artista.</em>
        </p>
        <p style={bodyText(16)}>
          Durante la activación se entregará un tibor cerámico horneado y material para para intervenirlo con engobes y esmaltes, de tal forma que hagan del tibor un objeto simbólico y representativo de la obra del artista. Además de la convivencia, les invitaremos a generar contenido y entrevistas para conversar acerca de su obra. Los costos del evento, material y quemas corren por parte de la casa. Las piezas serán expuestas durante la feria, del 4-7 de febrero de 2027.
        </p>

        {/* PAQUETES ADQUIRIBLES */}
        <h2 style={sectionTitle('Paquetes Adquiribles')}>Paquetes Adquiribles</h2>

        <h3 style={subsectionTitle(32)}>Modelo de Exhibición</h3>
        <p style={bodyText(16)}>
          En ARTE FACTO queremos ofrecer los mejores paquetes para aprovechar al máximo la obra del artista. Al ser una feria atípica, la obra de cada artista no será concentrada en un solo muro o espacio reservado individual.
        </p>
        <p style={bodyText(12)}>
          La curaduría y museografía, cuidadosamente realizada por el Comité Curatorial, dispondrá la obra de todxs lxs artistas como mejor ofrezcan narrativas, perspectivas y recorridos curados.
        </p>
        <p style={bodyText(12)}>
          De acuerdo al paquete que se adquiera —para obra bidimensional o tridimensional—, los curadores distribuirán la obra, respetando la cantidad de <strong>metros lineales</strong> o <strong>metros cuadrados</strong> incluidos en el paquete adquirido por artista. No hay límite de obra por paquete, mientras el formato y cantidad se ajusten realísticamente a las dimensiones del paquete adquirido.
        </p>

        <h3 style={subsectionTitle(40)}>Especificaciones</h3>
        <p style={bodyText(16)}>
          Al priorizar y privilegiar la curaduría y resolución visual de la Feria, ARTE FACTO se limita a colocar máximo 3 filas de obra en sentido vertical, permitiendo generar mosaicos a partir de la obra de múltiples artistas. Solo en casos que lo amerite, el Comité Curatorial se reserva la facultad de autorizar la colocación de obra por debajo o encima de las 3 filas ya dispuestas.
        </p>
        <p style={bodyText(12)}>
          En función de la cantidad de obra postulada, el Comité Curatorial hará lo posible por colocar toda la obra del artista y hacer rendir los metros del paquete adquirido. Sin embargo, el Comité Curatorial podrá, a su criterio, no utilizar todas las obras postuladas aún en la etapa de selección remota, evitando su envío.
        </p>

        <h3 style={subsectionTitle(40)}>Paquetes — Obra Bidimensional</h3>
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: COLORS.black }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Paquete</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Metros Lineales</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase I (-35%)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase II (-20%)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase III</th>
              </tr>
            </thead>
            <tbody>
              {PAQUETES_2D.map((paq, i) => (
                <tr key={paq.tipo} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)' }}>
                  <td style={{ padding: '12px 16px', color: COLORS.cream, fontWeight: 600 }}>{paq.tipo}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: 'rgba(244,237,228,0.9)' }}>{paq.metrosLineales}m</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase1} MXN</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase2} MXN</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase3} MXN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={subsectionTitle(32)}>Paquetes — Obra Tridimensional</h3>
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: COLORS.black }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Paquete</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Metros Cuadrados</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase I (-35%)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase II (-20%)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fase III</th>
              </tr>
            </thead>
            <tbody>
              {PAQUETES_3D.map((paq, i) => (
                <tr key={paq.tipo} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)' }}>
                  <td style={{ padding: '12px 16px', color: COLORS.cream, fontWeight: 600 }}>{paq.tipo}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: 'rgba(244,237,228,0.9)' }}>{paq.metrosCuadrados}m²</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase1} MXN</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase2} MXN</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(244,237,228,0.9)' }}>${paq.fase3} MXN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...bodyText(12), fontSize: 13, fontStyle: 'italic' }}>*Todos los precios incluyen IVA</p>

        {/* FORMATOS PARTICIPANTES */}
        <h2 style={sectionTitle('Formatos Participantes')}>Formatos Participantes</h2>

        <h3 style={subsectionTitle(32)}>Medios y Técnicas</h3>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {MEDIOS_TECNICAS.map((medio) => (
            <span key={medio} style={{ background: COLORS.black, color: COLORS.cream, padding: '8px 16px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>
              {medio}
            </span>
          ))}
        </div>

        <h3 style={subsectionTitle(40)}>Presentación y Representación</h3>
        <p style={bodyText(16)}>
          La temática y estilo es libre. El comité curatorial construirá los ejes temáticos a lo largo de las fases. Exploraciones de todo tipo son bienvenidas: abstractos (expresionismo, geometría, gestual, informalismo), figurativos (retrato, paisaje, bodegón, urbano), híbridos (figuración expandida, realismo mágico, fotografía intervenida), y demás corrientes y estilos.
        </p>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <h2 style={sectionTitle('Especificaciones Técnicas de Obra')}>Especificaciones Técnicas de Obra</h2>

        <h3 style={subsectionTitle(32)}>Obra Bidimensional</h3>
        <p style={bodyText(16)}>
          Sin dimensión máxima. La obra debe caber dentro del paquete adquirido. Para formatos muy grandes, cualquier especificación del montaje debe ser notificado vía artefacto.curatorial@gmail.com. Dípticos, trípticos y series deben adaptarse a esta medida por pieza. La obra seleccionada deberá entregarse enmarcada y lista para colgar, con sistema de montaje incluido.
        </p>

        <h3 style={subsectionTitle(32)}>Obra Tridimensional</h3>
        <p style={bodyText(16)}>
          Dimensión máxima de 120 cm por lado y peso máximo de 50kg o 200kg en caso de ser compuesta por varias piezas. De misma forma, la obra debe caber dentro del paquete adquirido. Si la pieza requiere base, peana o sistema de montaje especial, deberá indicarse en el registro de la postulación. La pieza debe estar lista para exhibirse.
        </p>

        {/* CRITERIOS Y PROCESO DE SELECCIÓN */}
        <h2 style={sectionTitle('Proceso de Selección')}>Proceso de Selección</h2>

        <h3 style={subsectionTitle(32)}>Criterios de Selección</h3>
        <p style={bodyText(16)}>El Comité Curatorial de ARTE FACTO evaluará cada postulación considerando:</p>
        <ul style={{ margin: '16px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Dominio técnico y resolución material de la obra propuesta.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Solidez conceptual y coherencia entre la propuesta, el portafolio y el discurso del/la artista.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Pertinencia dentro de la curaduría de ARTE FACTO | Éticas creativas, Segunda Edición.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Viabilidad de montaje dentro de las condiciones espaciales y técnicas de Estación Indianilla.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Diversidad de prácticas, generaciones y perspectivas representadas en el conjunto de la muestra.</span>
          </li>
        </ul>

        <h3 style={subsectionTitle(40)}>Etapas del Proceso</h3>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 24 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.cream }}>Etapa 1 — Revisión Administrativa</h4>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.85)' }}>
              Revisión administrativa de los datos de registro y documentación completa adjunta. Postulaciones incompletas, fuera de fecha o con imágenes de calidad insuficiente quedarán eliminadas automáticamente del proceso.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 24 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.cream }}>Etapa 2 — Evaluación Curatorial</h4>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.85)' }}>
              El Comité Curatorial revisa las postulaciones que completaron su registro exitosamente y evalúa las cualidades conceptuales y técnicas de la obra, como parte de la evaluación de la propuesta.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 24 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.cream }}>Etapa 3 — Confirmación Final</h4>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.85)' }}>
              Confirmación de la obra física, el espacio asignado dentro de la feria y el paquete de participación correspondiente. La decisión del Comité Curatorial es definitiva e inapelable.
            </p>
          </div>
        </div>

        {/* RECEPCIÓN Y DEVOLUCIÓN */}
        <h2 style={sectionTitle('Recepción y Devolución de Obra')}>Recepción y Devolución de Obra</h2>

        <h3 style={subsectionTitle(32)}>Recepción</h3>
        <p style={bodyText(16)}>
          Tras ser seleccionado, comenzado con los pagos y habiendo firmado la hoja de consigna, ARTE FACTO notificará vía correo electrónico la fecha y hora para la recepción física de la obra.
        </p>
        <p style={bodyText(12)}>
          Toda la obra deberá entregarse en la sede de <strong>ARTE FACTO | Estación Indianilla</strong>, en: Claudio Bernard 111, Doctores, Cuauhtémoc, 06720 Ciudad de México, CDMX.
        </p>
        <p style={bodyText(12)}>
          Los días de entrega disponibles únicamente son: <strong>1 y 2 de febrero de 2027.</strong>
        </p>
        <p style={bodyText(12)}>
          Lista para montaje, con ficha técnica al reverso. La obra bidimensional deberá entregarse como se postuló (si se registró con marco, debe venir enmarcada); la obra tridimensional lista para montaje, salvo si tiene especificaciones adicionales que deba saber el equipo ARTE FACTO.
        </p>

        <h3 style={subsectionTitle(32)}>Devolución</h3>
        <p style={bodyText(16)}>
          A diferencia de un salón de exhibición prolongado, ARTE FACTO es una feria de cuatro días: la devolución de obra no vendida se realiza de manera inmediata al cierre de la feria, el día el 7 de febrero, o al día siguiente, el 8 de febrero de 2027, en la sede de Estación Indianilla.
        </p>
        <p style={bodyText(12)}>
          Artistas que envíen obra desde otras ciudades y cuya pieza no se haya vendido recibirán de regreso su obra mediante guía prepagada, previamente proporcionada por el/la artista al momento de la entrega.
        </p>
        <p style={{ ...bodyText(12), fontSize: 13, fontStyle: 'italic', color: 'rgba(244,237,228,0.7)' }}>
          ARTE FACTO no se hace responsable por gastos de envíos, paquetería o trámites asociados a la recepción y devolución de la obra.
        </p>

        {/* PUNTOS GENERALES */}
        <h2 style={sectionTitle('Puntos Generales')}>Puntos Generales</h2>
        <ul style={{ margin: '24px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Las postulaciones incompletas o extemporáneas serán descalificadas sin excepción.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>La decisión del Comité Curatorial en cualquier fase del proceso es definitiva e inapelable.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>ARTE FACTO podrá utilizar imágenes de la obra y del/la artista seleccionadx con fines de difusión, comunicación y archivo del proyecto, otorgando siempre el crédito correspondiente.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>El manejo de las obras durante la feria será cuidadoso y adecuado para su correcta exhibición y conservación.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>ARTE FACTO no se hace responsable por daños derivados de un embalaje inadecuado o insuficiente por parte del/la artista.</span>
          </li>
          <li style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.9)' }}>
            <span style={{ color: COLORS.cream, fontWeight: 700 }}>→</span>
            <span>Cualquier situación no contemplada en la presente convocatoria quedará a juicio del Comité Curatorial.</span>
          </li>
        </ul>

        {/* BOUTIQUE, CATÁLOGO, TALLERES */}
        <h2 style={sectionTitle('Boutique ARTE FACTO')}>Boutique ARTE FACTO</h2>
        <p style={bodyText(24)}>
          La Boutique ARTE FACTO es el espacio de venta continua de la feria, donde conviven el punto de cobro de la obra exhibida, ediciones limitadas (prints) y una línea de mercancía producida exclusivamente para esta edición.
        </p>
        <p style={bodyText(12)}>
          <strong>Venta de obra original:</strong> La obra original permanece exhibida dentro del recorrido de la Exposición curada; es en la Boutique donde se efectúa el cobro correspondiente, mediante el sistema de ventas NFC.
        </p>
        <p style={bodyText(12)}>
          <strong>Prints y ediciones:</strong> Los artistas seleccionados podrán ofrecer prints de su obra bajo dos modalidades: (a) ediciones que el propio artista traiga y consigne para la venta, o (b) mediante el Paquete de Gráfica Digital: un servicio de producción de series limitadas ofrecido a los artistas seleccionados con un descuento preferente.
        </p>
        <p style={bodyText(12)}>
          <strong>Serigrafía:</strong> A cada artista seleccionado se le pedirá elegir una de sus obras participantes en ARTE FACTO, a partir de la cual se producirá un marco de serigrafía a una tinta. Con este marco, ARTE FACTO imprimirá playeras y totebags en vivo dentro de la Boutique.
        </p>
        <p style={bodyText(16)}>
          <strong>Comisiones sobre venta:</strong> Venta de prints: 50% para el artista | Venta de obra original: 25% comisión ARTE FACTO
        </p>

        <h2 style={sectionTitle('Catálogo Habilitado', 60)}>Catálogo Habilitado</h2>
        <p style={bodyText(24)}>
          Toda obra seleccionada formará parte del Catálogo Oficial ARTE FACTO | Edición II, disponible en formato digital para todos los asistentes y coleccionistas registrados, con crédito completo al artista y ficha técnica de cada pieza.
        </p>

        <h2 style={sectionTitle('Talleres', 60)}>Talleres</h2>
        <p style={bodyText(24)}>
          Durante los cuatro días de la feria, habrá talleres impartidos por artistas independientes y la academia de arte Atelier México ©, para ofrecer experiencias complementarias al público en general. El objetivo de los talleres es dar visibilidad a los procesos creativos.
        </p>
        <p style={bodyText(12)}>
          Si te interesa impartir un taller durante algún día de la feria, manda tu propuesta a artefacto.curatorial@gmail.com
        </p>

        {/* FECHAS IMPORTANTES */}
        <h2 style={sectionTitle('Fechas Importantes')}>Fechas Importantes</h2>
        <div style={{ marginTop: 32, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: COLORS.black }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hito</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', color: COLORS.cream, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {FECHAS_IMPORTANTES.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(244,237,228,0.1)' }}>
                  <td style={{ padding: '12px 20px', color: 'rgba(244,237,228,0.95)' }}>{item.hito}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'rgba(244,237,228,0.8)', fontStyle: item.fecha === 'Fecha por definir' ? 'italic' : 'normal' }}>{item.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA - DESCARGAR Y REGISTRARSE */}
        <div style={{ marginTop: 80, background: COLORS.black, padding: 48, textAlign: 'center' }}>
          <h3 style={{
            margin: '0 0 16px',
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 36,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: COLORS.cream
          }}>¿Listo para participar?</h3>
          <p style={{ margin: '0 0 32px', fontSize: 17, color: 'rgba(244,237,228,0.85)', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Descarga la convocatoria completa y regístrate para formar parte de ARTE FACTO {edicion}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/pdfs/Convocatoria_ARTEFACTO.pdf" download style={btn(COLORS.cream, COLORS.black)}>Descargar Convocatoria</a>
            <Link href={urlRegistro} style={btn(COLORS.red, COLORS.cream)}>{abierta ? 'Registrarse Ahora' : 'Inscripciones Cerradas'}</Link>
          </div>
        </div>

      </div>
    </section>

    {/* CSS para animación de bounce */}
    <style jsx>{`
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }
    `}</style>
    </>
  );
}
