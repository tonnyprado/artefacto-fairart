'use client'

import Link from 'next/link'
import { COLORS, FONTS, container } from '@/components/artefacto/theme'

export default function PrivacyPolicyPage() {
  const styles = {
    page: {
      minHeight: '100vh',
      background: COLORS.cream,
      color: COLORS.black,
    },
    header: {
      background: COLORS.black,
      color: COLORS.cream,
      padding: '120px 24px 60px',
      textAlign: 'center',
    },
    headerTitle: {
      fontFamily: FONTS.display,
      fontWeight: FONTS.displayWeight,
      fontStyle: FONTS.displayStyle,
      fontSize: 'clamp(32px, 5vw, 56px)',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      margin: 0,
    },
    headerSubtitle: {
      fontFamily: FONTS.body,
      fontWeight: 300,
      fontSize: '16px',
      marginTop: '16px',
      opacity: 0.7,
    },
    editionBadge: {
      display: 'inline-block',
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: '14px',
      marginTop: '12px',
      padding: '6px 16px',
      background: 'rgba(244,237,228,0.1)',
      borderRadius: '4px',
    },
    content: {
      ...container,
      padding: '60px 24px 100px',
    },
    section: {
      marginBottom: '48px',
    },
    sectionTitle: {
      fontFamily: FONTS.display,
      fontWeight: 700,
      fontSize: '22px',
      color: COLORS.red,
      marginBottom: '16px',
      letterSpacing: '0.02em',
    },
    subsectionTitle: {
      fontFamily: FONTS.body,
      fontWeight: 700,
      fontSize: '16px',
      color: COLORS.black,
      marginBottom: '12px',
      marginTop: '20px',
    },
    paragraph: {
      fontFamily: FONTS.body,
      fontWeight: FONTS.bodyWeight,
      fontSize: '16px',
      lineHeight: 1.8,
      marginBottom: '16px',
      color: COLORS.gray,
    },
    list: {
      fontFamily: FONTS.body,
      fontWeight: FONTS.bodyWeight,
      fontSize: '16px',
      lineHeight: 1.8,
      color: COLORS.gray,
      paddingLeft: '24px',
      marginBottom: '16px',
    },
    listItem: {
      marginBottom: '8px',
    },
    highlight: {
      fontFamily: FONTS.body,
      fontWeight: 600,
      fontSize: '16px',
      color: COLORS.black,
      background: 'rgba(180,50,50,0.08)',
      borderLeft: `4px solid ${COLORS.red}`,
      paddingLeft: '20px',
      paddingTop: '16px',
      paddingBottom: '16px',
      paddingRight: '20px',
      margin: '32px 0',
      borderRadius: '0 8px 8px 0',
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: FONTS.body,
      fontWeight: 600,
      fontSize: '14px',
      color: COLORS.red,
      textDecoration: 'none',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginTop: '40px',
    },
    footer: {
      background: COLORS.black,
      color: COLORS.cream,
      padding: '40px 24px',
      textAlign: 'center',
    },
    footerText: {
      fontFamily: FONTS.body,
      fontSize: '14px',
      opacity: 0.6,
    },
    link: {
      color: COLORS.red,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/assets/wordmark-cream.svg"
            alt="ARTEFACTO"
            style={{ height: '32px', marginBottom: '24px' }}
          />
        </Link>
        <h1 style={styles.headerTitle}>Aviso de Privacidad</h1>
        <p style={styles.editionBadge}>ARTE FACTO | Eticas Creativas — Edicion II</p>
        <p style={styles.headerSubtitle}>
          Ultima actualizacion: 23 de agosto de 2026
        </p>
      </header>

      {/* Content */}
      <main style={styles.content}>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Responsable del tratamiento</h2>
          <p style={styles.paragraph}>
            <strong>ARTE FACTO ETICAS CREATIVAS, S. de R.L. de C.V.</strong> (en adelante, "ARTE FACTO"), con domicilio en Providencia 325, Col. Del Valle Norte, C.P. 03103, Alcaldia Benito Juarez, Ciudad de Mexico, es responsable del tratamiento de los datos personales que usted proporciona a traves de este sitio web, en terminos de la <strong>Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares</strong> (LFPDPPP), su Reglamento y demas normativa aplicable.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Datos personales que recabamos</h2>

          <p style={styles.subsectionTitle}>Al registrarse y postular a la convocatoria:</p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Datos de identificacion y contacto:</strong> nombre completo, fecha de nacimiento (para verificar mayoria de edad), correo electronico, telefono y ciudad de residencia.</li>
            <li style={styles.listItem}><strong>Datos de trayectoria profesional:</strong> semblanza, CV y statement artistico.</li>
            <li style={styles.listItem}><strong>Informacion de obra:</strong> imagenes, fichas tecnicas, medidas y precios.</li>
          </ul>

          <p style={styles.subsectionTitle}>Unicamente si resulta seleccionado/a:</p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Datos fiscales (RFC, constancia de situacion fiscal) y datos bancarios, necesarios para la gestion de pagos, facturacion y liquidacion de ventas.</li>
          </ul>

          <p style={styles.subsectionTitle}>De los compradores de obra:</p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Datos de identificacion y contacto (nombre, correo, telefono), domicilio de entrega cuando se solicite envio, y los datos de pago necesarios para procesar la compra. Los datos de pago con tarjeta son capturados y procesados directamente por el proveedor de la pasarela de pagos.</li>
          </ul>

          <div style={styles.highlight}>
            ARTE FACTO <strong>no recaba datos personales sensibles</strong>. Le pedimos no incluir este tipo de informacion en los campos libres del formulario.
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Finalidades primarias (necesarias)</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>Gestionar su registro y postulacion a la convocatoria.</li>
            <li style={styles.listItem}>Verificar el cumplimiento de los requisitos de participacion.</li>
            <li style={styles.listItem}>Someter su postulacion al proceso de evaluacion del comite curatorial.</li>
            <li style={styles.listItem}>Notificarle los resultados del proceso de seleccion.</li>
            <li style={styles.listItem}>En caso de ser seleccionado/a: gestionar el cobro de la tarifa de participacion, la facturacion, la firma del Acuerdo de Consignacion, la logistica de recepcion y devolucion de obra, y la liquidacion de ventas.</li>
            <li style={styles.listItem}>Respecto de los compradores: procesar la compra de obra, emitir el comprobante correspondiente y coordinar la entrega o el envio de la pieza.</li>
            <li style={styles.listItem}>Difundir la convocatoria y el evento utilizando las imagenes de obra postulada, conforme a los Terminos y Condiciones.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Finalidades secundarias (no necesarias)</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>Enviarle informacion sobre <strong>futuras ediciones, convocatorias, eventos y actividades de ARTE FACTO</strong>.</li>
          </ul>
          <p style={styles.paragraph}>
            Si no desea que sus datos se utilicen para esta finalidad, puede manifestarlo en cualquier momento escribiendo a <a href="mailto:curatorial@arte-facto.mx" style={styles.link}>curatorial@arte-facto.mx</a>. La negativa no afectara su postulacion ni su participacion.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Transferencias y encargados</h2>
          <p style={styles.paragraph}>
            Para las finalidades descritas, sus datos podran ser compartidos con terceros que intervienen en la operacion de la convocatoria y del evento, exclusivamente en la medida necesaria:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Integrantes del <strong>comite curatorial</strong> (evaluacion de postulaciones).</li>
            <li style={styles.listItem}><strong>Proveedor de pasarela de pagos</strong> (procesamiento de pagos de artistas seleccionados y de compras de obra por los compradores).</li>
            <li style={styles.listItem}><strong>Proveedores de desarrollo y hosting</strong> del sitio web.</li>
            <li style={styles.listItem}><strong>Agencia de marketing</strong> de ARTE FACTO (difusion del evento).</li>
          </ul>
          <p style={styles.paragraph}>
            Dichos terceros estan obligados a tratar sus datos unicamente conforme a las instrucciones de ARTE FACTO y con deberes de confidencialidad. <strong>ARTE FACTO no vende ni renta sus datos personales.</strong> Fuera de los supuestos anteriores, no se realizaran transferencias que requieran su consentimiento, salvo las excepciones previstas en el articulo 37 de la LFPDPPP.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Derechos ARCO</h2>
          <p style={styles.paragraph}>
            Usted tiene derecho a <strong>Acceder, Rectificar y Cancelar</strong> sus datos personales, asi como a <strong>Oponerse</strong> a su tratamiento (derechos ARCO), y a revocar el consentimiento que nos haya otorgado.
          </p>
          <p style={styles.paragraph}>
            Para ejercerlos, envie una solicitud a <a href="mailto:curatorial@arte-facto.mx" style={styles.link}>curatorial@arte-facto.mx</a> indicando: (i) nombre completo y medio de contacto; (ii) documento que acredite su identidad; (iii) descripcion clara de los datos y del derecho que desea ejercer. Responderemos en los plazos previstos por la LFPDPPP.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Conservacion y seguridad</h2>
          <p style={styles.paragraph}>
            Sus datos se conservaran durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables. ARTE FACTO implementa medidas de seguridad administrativas, tecnicas y fisicas razonables para proteger sus datos contra dano, perdida, alteracion o uso no autorizado.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Cookies y tecnologias similares</h2>
          <p style={styles.paragraph}>
            Este sitio puede utilizar cookies y tecnologias similares con fines de funcionamiento y medicion de audiencia. Usted puede deshabilitarlas desde la configuracion de su navegador; hacerlo podria afectar algunas funciones del sitio.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Cambios al aviso de privacidad</h2>
          <p style={styles.paragraph}>
            Cualquier modificacion a este aviso se publicara en este sitio web, indicando la fecha de su ultima actualizacion. El uso continuado del sitio tras la publicacion de cambios implica su conocimiento de los mismos.
          </p>
        </section>

        <Link href="/" style={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al inicio
        </Link>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          {new Date().getFullYear()} ARTE FACTO. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
