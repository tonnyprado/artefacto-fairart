'use client'

import Link from 'next/link'
import { COLORS, FONTS, container } from '@/components/artefacto/theme'

export default function TermsPage() {
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
      fontSize: 'clamp(28px, 5vw, 56px)',
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
      fontWeight: 500,
      fontSize: '17px',
      color: COLORS.black,
      margin: '24px 0',
      lineHeight: 1.7,
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
        <h1 style={styles.headerTitle}>Terminos y Condiciones de Postulacion</h1>
        <p style={styles.editionBadge}>Convocatoria ARTE FACTO | Eticas Creativas — Edicion II</p>
        <p style={styles.headerSubtitle}>
          Ultima actualizacion: 23 de agosto de 2026
        </p>
      </header>

      {/* Content */}
      <main style={styles.content}>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Identidad del organizador</h2>
          <p style={styles.paragraph}>
            La convocatoria y el evento <strong>ARTE FACTO | Eticas Creativas, Edicion II</strong> (en adelante, "ARTE FACTO" o "el evento") son organizados por <strong>ARTE FACTO ETICAS CREATIVAS, S. de R.L. de C.V.</strong> (en adelante, "la Organizacion"), con domicilio para efectos de este documento en Providencia 325, Col. Del Valle Norte, C.P. 03103, Alcaldia Benito Juarez, Ciudad de Mexico.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Objeto</h2>
          <p style={styles.paragraph}>
            Estos Terminos y Condiciones regulan el registro y la postulacion de artistas a la convocatoria de ARTE FACTO a traves del sitio web oficial. Las condiciones de participacion, exhibicion, consignacion y venta de obra de los artistas seleccionados se formalizaran en el <strong>Acuerdo de Consignacion de Obra</strong> que cada artista seleccionado debera firmar como requisito para participar (ver clausula 9).
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Aceptacion</h2>
          <p style={styles.paragraph}>
            Al completar el registro y enviar una postulacion, la persona postulante declara que ha leido y acepta integramente estos Terminos y Condiciones y el <Link href="/privacy-policy" style={styles.link}>Aviso de Privacidad</Link> publicado en este sitio. Si no esta de acuerdo con ellos, debera abstenerse de postular.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Requisitos para postular</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>Ser <strong>mayor de 18 anos</strong> a la fecha de la postulacion.</li>
            <li style={styles.listItem}>Postular <strong>obra propia y original</strong>, siendo titular de los derechos sobre la misma.</li>
            <li style={styles.listItem}>Proporcionar informacion veraz, completa y actualizada en el formulario de registro.</li>
            <li style={styles.listItem}>Cumplir con las bases, categorias, formatos y fechas publicadas en la convocatoria oficial vigente en este sitio.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Gratuidad de la postulacion</h2>
          <div style={styles.highlight}>
            <strong>Postular no tiene ningun costo.</strong> Unicamente los artistas seleccionados deberan cubrir la tarifa de participacion correspondiente al paquete elegido, conforme a las bases de la convocatoria y a la clausula 7.
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Proceso de seleccion</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>La seleccion se realiza por fases, conforme al calendario publicado en la convocatoria oficial.</li>
            <li style={styles.listItem}>Las postulaciones son evaluadas por el <strong>comite curatorial</strong> de ARTE FACTO.</li>
            <li style={styles.listItem}><strong>Las decisiones del comite curatorial son definitivas e inapelables.</strong> La Organizacion no esta obligada a motivar o justificar individualmente los resultados.</li>
            <li style={styles.listItem}>Los resultados se notificaran a las personas seleccionadas a traves de los datos de contacto proporcionados en el registro, en las fechas de publicacion de resultados de cada fase.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Tarifas y pago de participacion</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>Postular es gratuito. <strong>En esta etapa no debe realizarse pago alguno:</strong> el pago unicamente concierne a los artistas que resulten seleccionados.</li>
            <li style={styles.listItem}>Las tarifas de participacion por paquete son las publicadas en la convocatoria oficial vigente en este sitio.</li>
            <li style={styles.listItem}>Junto con la publicacion de resultados de cada fase, los artistas seleccionados recibiran el calendario, los medios y las condiciones de pago, mismos que se formalizaran en el Acuerdo de Consignacion de Obra. El lugar dentro del evento queda garantizado unicamente con el pago realizado conforme a dichas condiciones.</li>
            <li style={styles.listItem}>Todo pago genera el comprobante fiscal correspondiente.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Politica de pagos no reembolsables y fuerza mayor</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Los pagos de participacion no son reembolsables.</strong> En caso de que el artista seleccionado decida retirarse del evento despues de haber pagado, por cualquier causa, no habra devolucion total ni parcial.</li>
            <li style={styles.listItem}>El compromiso de la Organizacion es la realizacion del evento. La Organizacion podra realizar <strong>ajustes de sede, fechas u horarios</strong> por necesidades de produccion, notificandolo oportunamente a los participantes; dichos ajustes no constituyen incumplimiento ni generan derecho a reembolso, siempre que el evento se realice dentro de la misma temporada.</li>
            <li style={styles.listItem}><strong>No procederan reembolsos en ningun caso, incluidos el caso fortuito y la fuerza mayor.</strong> Si un hecho ajeno al control de la Organizacion (a titulo enunciativo: sismos, contingencias sanitarias, actos de autoridad) impidiera la realizacion del evento en las fechas previstas, el evento se reprogramara y <strong>el pago del artista se acreditara integramente a la fecha reprogramada o, en su defecto, a la siguiente edicion de ARTE FACTO</strong>, conservando el artista su lugar y condiciones. En ningun supuesto habra devoluciones en efectivo.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Acuerdo de Consignacion de Obra</h2>
          <p style={styles.paragraph}>
            La participacion de los artistas seleccionados se regira por el Acuerdo de Consignacion de Obra, que debera firmarse previo a la recepcion de obra y que contendra, entre otros, los siguientes terminos que el postulante conoce y acepta desde ahora:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>La venta de obra se gestiona a traves de ARTE FACTO, que retiene una <strong>comision del 25%</strong> sobre el precio de venta fijado por el Artista, conservando el Artista el <strong>75%</strong>. Los precios se manejan <strong>sin IVA</strong>; el IVA (16%) y cualquier cargo adicional derivado del metodo de pago (por ejemplo, comisiones por pago con tarjeta) o del envio de la obra se <strong>cotizaran al momento y correra por cuenta del comprador</strong>, sin afectar el porcentaje que recibe el Artista.</li>
            <li style={styles.listItem}>Una <strong>comision del 15%</strong> aplicara sobre ventas concretadas dentro de los <strong>2 (dos) meses posteriores al evento</strong> con clientes cuyo contacto se haya originado en el evento, previa notificacion del artista a la Organizacion.</li>
            <li style={styles.listItem}>El artista asumira los riesgos inherentes a la exhibicion de su obra y liberara a la Organizacion de responsabilidad en los terminos que se detallan en dicho acuerdo, el cual incluye la recomendacion de asegurar la obra por cuenta propia.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Uso de imagen y materiales de postulacion</h2>
          <p style={styles.paragraph}>
            El postulante autoriza a la Organizacion a utilizar las imagenes de obra y la informacion proporcionadas en su postulacion con fines de evaluacion curatorial y, en caso de resultar seleccionado, para la difusion de la convocatoria, del evento y de sus resultados en medios digitales e impresos de ARTE FACTO, siempre con credito al artista. La titularidad de la obra y de sus derechos permanece en el artista.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Datos personales</h2>
          <p style={styles.paragraph}>
            Los datos personales recabados durante el registro y la postulacion se trataran conforme al <Link href="/privacy-policy" style={styles.link}>Aviso de Privacidad</Link> disponible en este sitio, que forma parte integral de estos Terminos y Condiciones.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>12. Modificaciones</h2>
          <p style={styles.paragraph}>
            La Organizacion podra actualizar estos Terminos y Condiciones y las bases de la convocatoria, publicando la version vigente en este sitio. Las postulaciones se regiran por la version vigente al momento de su envio.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>13. Legislacion aplicable y jurisdiccion</h2>
          <p style={styles.paragraph}>
            Para la interpretacion y cumplimiento de estos Terminos y Condiciones, las partes se someten a las leyes aplicables de los Estados Unidos Mexicanos y a la jurisdiccion de los tribunales competentes de la Ciudad de Mexico, renunciando a cualquier otro fuero. Cualquier controversia se procurara resolver primero mediante dialogo directo y, en su caso, mediacion, antes de emprender acciones legales.
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
