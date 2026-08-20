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
      fontSize: '24px',
      color: COLORS.red,
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
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
      fontFamily: FONTS.highlight,
      fontStyle: FONTS.highlightStyle,
      fontSize: '18px',
      color: COLORS.black,
      borderLeft: `4px solid ${COLORS.red}`,
      paddingLeft: '20px',
      margin: '32px 0',
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
        <p style={styles.headerSubtitle}>
          Actualizado: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Content */}
      <main style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Responsable del Tratamiento</h2>
          <p style={styles.paragraph}>
            <strong>ARTEFACTO - Feria de Arte Contemporaneo</strong> (en adelante "ARTEFACTO"), con domicilio en
            Centro Cultural Estacion Indianilla, Claudio Bernard 111, Col. Doctores, Alcaldia Cuauhtemoc,
            C.P. 06720, Ciudad de Mexico, es responsable del tratamiento de sus datos personales.
          </p>
          <p style={styles.paragraph}>
            Para cualquier duda o aclaracion relacionada con el presente Aviso de Privacidad, puede
            contactarnos a traves de: <a href="mailto:convocatoria@artefacto.mx" style={{ color: COLORS.red }}>convocatoria@artefacto.mx</a>
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Datos Personales que Recabamos</h2>
          <p style={styles.paragraph}>
            Para las finalidades senaladas en el presente Aviso de Privacidad, podemos recabar las siguientes
            categorias de datos personales:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Datos de identificacion:</strong> nombre completo, fecha de nacimiento, nacionalidad, fotografia.</li>
            <li style={styles.listItem}><strong>Datos de contacto:</strong> correo electronico, numero telefonico, direccion.</li>
            <li style={styles.listItem}><strong>Datos profesionales:</strong> trayectoria artistica, portafolio, obras, curriculum vitae.</li>
            <li style={styles.listItem}><strong>Datos de redes sociales:</strong> perfiles de Instagram, sitio web personal.</li>
            <li style={styles.listItem}><strong>Datos financieros:</strong> informacion de pago para inscripciones (procesados por terceros seguros).</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Finalidades del Tratamiento</h2>
          <p style={styles.paragraph}>
            Sus datos personales seran utilizados para las siguientes finalidades primarias:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Gestionar su participacion en la convocatoria de artistas de ARTEFACTO.</li>
            <li style={styles.listItem}>Evaluar y seleccionar obras para su exhibicion en la feria.</li>
            <li style={styles.listItem}>Comunicarnos con usted respecto a su postulacion y participacion.</li>
            <li style={styles.listItem}>Procesar pagos relacionados con inscripciones y servicios.</li>
            <li style={styles.listItem}>Crear materiales de difusion y promocion del evento.</li>
          </ul>
          <p style={styles.paragraph}>
            Adicionalmente, con su consentimiento, utilizaremos sus datos para:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Enviarle informacion sobre futuras ediciones y eventos relacionados.</li>
            <li style={styles.listItem}>Compartir su perfil artistico en nuestras plataformas digitales.</li>
            <li style={styles.listItem}>Incluirlo en catalogos impresos y digitales del evento.</li>
          </ul>
        </section>

        <div style={styles.highlight}>
          "En ARTEFACTO valoramos y protegemos la privacidad de nuestra comunidad artistica.
          Su informacion es tratada con el maximo cuidado y confidencialidad."
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Transferencia de Datos</h2>
          <p style={styles.paragraph}>
            Sus datos personales podran ser transferidos y tratados dentro y fuera del pais por:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Curadores y jurados para el proceso de seleccion de obras.</li>
            <li style={styles.listItem}>Proveedores de servicios de pago para procesar transacciones.</li>
            <li style={styles.listItem}>Autoridades competentes cuando sea requerido por ley.</li>
          </ul>
          <p style={styles.paragraph}>
            Nos comprometemos a tomar las medidas necesarias para que los terceros con quienes compartamos
            sus datos mantengan medidas de seguridad equivalentes a las nuestras.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Derechos ARCO</h2>
          <p style={styles.paragraph}>
            Usted tiene derecho a conocer que datos personales tenemos, para que los utilizamos y
            las condiciones de su uso (Acceso). Asimismo, es su derecho solicitar la correccion de su
            informacion personal en caso de que este desactualizada, sea inexacta o incompleta (Rectificacion);
            que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no esta
            siendo utilizada adecuadamente (Cancelacion); asi como oponerse al uso de sus datos personales
            para fines especificos (Oposicion).
          </p>
          <p style={styles.paragraph}>
            Para el ejercicio de cualquiera de estos derechos, puede enviar una solicitud a:
            <a href="mailto:convocatoria@artefacto.mx" style={{ color: COLORS.red }}> convocatoria@artefacto.mx</a>
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Uso de Cookies y Tecnologias</h2>
          <p style={styles.paragraph}>
            Nuestro sitio web utiliza cookies y otras tecnologias de rastreo para mejorar su experiencia
            de navegacion, analizar el trafico del sitio y personalizar el contenido. Puede configurar su
            navegador para rechazar todas las cookies o para indicar cuando se envia una cookie.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Seguridad de Datos</h2>
          <p style={styles.paragraph}>
            En ARTEFACTO implementamos medidas de seguridad tecnicas, administrativas y fisicas para
            proteger sus datos personales contra dano, perdida, alteracion, destruccion o uso, acceso o
            tratamiento no autorizado. Nuestra infraestructura tecnologica utiliza encriptacion SSL y
            servidores seguros para el almacenamiento de informacion.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Modificaciones al Aviso</h2>
          <p style={styles.paragraph}>
            Nos reservamos el derecho de efectuar modificaciones o actualizaciones al presente Aviso de
            Privacidad. Cualquier cambio sera notificado a traves de nuestro sitio web o por correo electronico.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Contacto</h2>
          <p style={styles.paragraph}>
            Si tiene alguna pregunta sobre este Aviso de Privacidad o sobre nuestras practicas de
            privacidad, contactenos:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Email:</strong> convocatoria@artefacto.mx</li>
            <li style={styles.listItem}><strong>Telefono:</strong> +52 55 7836 3207</li>
            <li style={styles.listItem}><strong>Direccion:</strong> Centro Cultural Estacion Indianilla, Claudio Bernard 111, Col. Doctores, Cuauhtemoc, 06720 CDMX</li>
          </ul>
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
          {new Date().getFullYear()} ARTEFACTO. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
