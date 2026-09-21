'use client';
import { useState, useEffect } from 'react';
import { COLORS, FONTS, container } from './theme';
import { useTextScramble } from './useTextScramble';
import TransitionLink from './TransitionLink';

// Componente de card con hover
function HoverCard({ children, style }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        padding: '28px',
        background: isHovered ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)',
        borderRadius: 16,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : 'none',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

// Componente de botón con hover
function HoverButton({ href, bg, color, hoverBg, hoverColor, children, download, external, isTransitionLink, disabled, ...props }) {
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    background: disabled ? 'rgba(0,0,0,0.3)' : (isHovered ? hoverBg : bg),
    color: disabled ? 'rgba(244,237,228,0.4)' : (isHovered ? hoverColor : color),
    padding: '16px 28px',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 12,
    transform: disabled ? 'translateY(0)' : (isHovered ? 'translateY(-2px)' : 'translateY(0)'),
    boxShadow: disabled ? 'none' : (isHovered ? '0 8px 24px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    ...props.style,
  };

  if (isTransitionLink) {
    return (
      <TransitionLink
        href={href}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </TransitionLink>
    );
  }

  // Si es download + external, abrir nueva pestaña Y descargar simultáneamente
  const handleClick = (e) => {
    if (download && external) {
      e.preventDefault();
      // Abrir en nueva pestaña
      window.open(href, '_blank', 'noopener,noreferrer');
      // Iniciar descarga
      const link = document.createElement('a');
      link.href = href;
      link.download = typeof download === 'string' ? download : '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download && !external ? download : undefined}
      onClick={handleClick}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
}

export default function ConvocatoriaSection({ edicion = '2027', abierta = true, urlRegistro = '/registro' }) {
  const [inscripcionesAbiertas, setInscripcionesAbiertas] = useState(abierta);
  const [loading, setLoading] = useState(true);

  const titleScramble = useTextScramble('Convocatoria Abierta', {
    duration: 1200,
    delay: 400,
  });

  // Consultar estado de inscripciones desde el API
  useEffect(() => {
    const fetchInscripcionesEstado = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/fases`);

        if (response.ok) {
          const data = await response.json();
          // Buscar la fase activa con inscripciones abiertas
          const faseActiva = data.data?.find(fase => fase.inscripciones_abiertas === true);
          setInscripcionesAbiertas(!!faseActiva);
        } else {
          // Si falla el API, usar el valor por defecto de la prop
          setInscripcionesAbiertas(abierta);
        }
      } catch (error) {
        console.error('Error al consultar estado de inscripciones:', error);
        // Si hay error, usar el valor por defecto de la prop
        setInscripcionesAbiertas(abierta);
      } finally {
        setLoading(false);
      }
    };

    fetchInscripcionesEstado();
  }, [abierta]);

  const sectionHeader = {
    margin: '0 0 14px',
    fontFamily: FONTS.subtitle,
    fontWeight: FONTS.subtitleWeight,
    fontStyle: FONTS.subtitleStyle,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: COLORS.cream,
    opacity: 0.9,
  };

  const listItem = {
    display: 'flex',
    gap: 10,
    fontSize: 13,
    lineHeight: 1.55,
    color: 'rgba(244,237,228,0.8)',
    marginBottom: 8,
  };

  const bullet = {
    color: 'rgba(244,237,228,0.5)',
    fontWeight: 400,
    flexShrink: 0,
  };

  return (
    <>
      {/* PANTALLA INICIAL - HERO */}
      <section
        id="convocatoria"
        style={{
          scrollMarginTop: 0,
          minHeight: '100vh',
          background: COLORS.red,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Título principal en dos líneas */}
        <div style={{ marginBottom: 32 }}>
          <h1
            ref={titleScramble.ref}
            style={{
              margin: '0 0 8px',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(32px, 7vw, 80px)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: COLORS.cream,
              lineHeight: 1,
            }}
          >
            Convocatoria Abierta
          </h1>
          <span
            style={{
              display: 'block',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(20px, 4vw, 42px)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: COLORS.cream,
              opacity: 0.85,
            }}
          >
            Edición 2026
          </span>
        </div>

        {/* Subtítulo en dos líneas */}
        <div style={{
          marginBottom: 40,
          maxWidth: 600,
        }}>
          <p style={{
            margin: '0 0 6px',
            fontSize: 'clamp(15px, 2vw, 19px)',
            lineHeight: 1.5,
            color: 'rgba(244,237,228,0.95)',
            fontFamily: FONTS.body,
            fontWeight: 500,
          }}>
            Una oportunidad para exponer y comercializar tu obra
          </p>
          <p style={{
            margin: '0 0 16px',
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            lineHeight: 1.5,
            color: 'rgba(244,237,228,0.75)',
            fontFamily: FONTS.body,
            fontStyle: 'italic',
          }}>
            en un espacio dedicado al arte y diseño contemporáneo
          </p>
          <p style={{
            margin: 0,
            fontSize: 'clamp(13px, 1.5vw, 15px)',
            lineHeight: 1.5,
            color: 'rgba(244,237,228,0.65)',
            fontFamily: FONTS.body,
            letterSpacing: '0.02em',
          }}>
            del 4 al 7 de febrero de 2027 en el Centro Cultural Estación Indianilla
          </p>
        </div>

        {/* Botones de acción */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            margin: '0 0 16px',
            fontSize: 13,
            color: 'rgba(244,237,228,0.6)',
            fontFamily: FONTS.body,
            letterSpacing: '0.04em',
          }}>
            Descarga la convocatoria completa o regístrate directamente
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <HoverButton
              href="/convocatoria-artefacto.pdf"
              bg={COLORS.cream}
              color={COLORS.black}
              hoverBg={COLORS.black}
              hoverColor={COLORS.cream}
              download
              external
            >
              Descargar PDF
            </HoverButton>
            <HoverButton
              href={urlRegistro}
              bg={COLORS.black}
              color={COLORS.cream}
              hoverBg={COLORS.cream}
              hoverColor={COLORS.black}
              isTransitionLink
              disabled={!inscripcionesAbiertas}
            >
              {inscripcionesAbiertas ? 'Registrarse' : 'Registro cerrado'}
            </HoverButton>
          </div>
        </div>

        {/* Indicador de scroll - desliza hacia abajo */}
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
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(244,237,228,0.6)',
            fontFamily: FONTS.body
          }}>
            Desliza hacia abajo
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(244,237,228,0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </section>

      {/* CONTENIDO DE LA CONVOCATORIA */}
      <section style={{
        background: COLORS.red,
        color: COLORS.cream,
        padding: '100px 24px 80px',
      }}>
        <div style={{ ...container, maxWidth: 1100 }}>

          {/* LA FERIA - Sección destacada */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{
              margin: '0 0 28px',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(24px, 3vw, 32px)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: COLORS.cream,
            }}>
              La Feria
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxWidth: 800 }}>
              {[
                'ARTEFACTO es una feria de arte y diseño contemporáneo que reúne a artistas, diseñadores, galerías, coleccionistas y público en general.',
                'Nuestro objetivo es crear un espacio de encuentro, exposición y comercialización de obra de artistas emergentes y consolidados.',
                'La feria incluye stands de artistas, galerías, talleres, charlas, performances y actividades especiales.',
                'Buscamos proyectos que exploren las fronteras entre arte, diseño, artesanía y nuevos medios.'
              ].map((item, i) => (
                <li key={i} style={{
                  display: 'flex',
                  gap: 14,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'rgba(244,237,228,0.9)',
                  marginBottom: 14,
                }}>
                  <span style={{ color: COLORS.cream, fontWeight: 700, flexShrink: 0 }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Texto destacado de comisiones */}
          <p style={{
            margin: '0 0 48px',
            fontSize: 17,
            lineHeight: 1.6,
            color: COLORS.cream,
            fontFamily: FONTS.body,
            textAlign: 'center',
          }}>
            <strong>COMISIONES:</strong> Sobre cada venta realizada en la feria se aplicará una comisión del <strong>75% para el artista</strong>, 25% para ARTEFACTO
          </p>

          {/* INFORMACIÓN DE REGISTRO - Grid organizado */}
          <div
            className="convocatoria-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              marginBottom: 48,
            }}
          >

            {/* ¿Cómo postular? */}
            <HoverCard>
              <h3 style={sectionHeader}>▸ ¿Cómo postular?</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  'Completa el formulario de registro en línea',
                  'Adjunta portafolio digital (máx. 10 imágenes)',
                  'Incluye descripción de tu proyecto y propuesta de stand',
                  'Especifica dimensiones y requerimientos técnicos',
                  'Espera la confirmación del comité curatorial'
                ].map((item, i) => (
                  <li key={i} style={listItem}>
                    <span style={bullet}>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </HoverCard>

            {/* Requisitos generales */}
            <HoverCard>
              <h3 style={sectionHeader}>▸ Requisitos generales</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  'Ser mayor de 18 años',
                  'Obra original y de autoría propia',
                  'Disponibilidad para montaje (2-3 febrero) y desmontaje (7-8 febrero)',
                  'Compromiso de atención del stand durante toda la feria',
                  'Seguro de obra bajo responsabilidad del artista'
                ].map((item, i) => (
                  <li key={i} style={listItem}>
                    <span style={bullet}>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </HoverCard>

            {/* Selección y exhibición */}
            <HoverCard>
              <h3 style={sectionHeader}>▸ Selección y exhibición</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  'El comité curatorial revisará todas las postulaciones',
                  'Notificación de aceptación: 15 de febrero de 2027',
                  'Stand básico incluido (2x2m, iluminación, muro)',
                  'Posibilidad de adquirir espacio adicional',
                  'Difusión en redes y medios de ARTEFACTO'
                ].map((item, i) => (
                  <li key={i} style={listItem}>
                    <span style={bullet}>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </HoverCard>

          </div>

          {/* Fechas clave - Sección separada */}
          <div style={{
            marginBottom: 56,
            textAlign: 'center',
          }}>
            <h3 style={{
              margin: '0 0 24px',
              fontFamily: FONTS.subtitle,
              fontWeight: FONTS.subtitleWeight,
              fontStyle: FONTS.subtitleStyle,
              fontSize: 14,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.cream,
            }}>
              Fechas clave
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}>
              {[
                { title: 'Apertura de convocatoria', text: '24 de agosto de 2026' },
                { title: 'Fase I', text: '24 de agosto a 19 de septiembre' },
                { title: 'Resultados Fase I', text: '27 de septiembre' },
                { title: 'Fase II', text: '28 de septiembre a 17 de octubre' },
                { title: 'Resultados Fase II', text: '24 de octubre' },
                { title: 'Fase III', text: '25 de octubre a 13 de noviembre' },
                { title: 'Resultados Fase III', text: '20 de noviembre' },
                { title: 'Feria', text: '4 al 7 de febrero de 2027' }
              ].map((item, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(244,237,228,0.85)',
                }}>
                  <strong style={{ color: COLORS.cream }}>{item.title}:</strong> {item.text}
                </p>
              ))}
            </div>
          </div>

          {/* CTA Final - Botones */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            paddingTop: 40,
            borderTop: '1px solid rgba(244,237,228,0.15)',
          }}>
            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <HoverButton
                href="/convocatoria-artefacto.pdf"
                bg={COLORS.cream}
                color={COLORS.black}
                hoverBg={COLORS.black}
                hoverColor={COLORS.cream}
                download
                external
              >
                Descargar convocatoria
              </HoverButton>
              <HoverButton
                href={urlRegistro}
                bg={COLORS.black}
                color={COLORS.cream}
                hoverBg={COLORS.cream}
                hoverColor={COLORS.black}
                isTransitionLink
                disabled={!inscripcionesAbiertas}
              >
                {inscripcionesAbiertas ? 'Iniciar registro' : 'Registro cerrado'}
              </HoverButton>
            </div>
            <a
              href="mailto:curatorial@arte-facto.mx"
              style={{
                fontSize: 13,
                color: 'rgba(244,237,228,0.55)',
                textDecoration: 'none',
                fontFamily: FONTS.body,
                letterSpacing: '0.03em',
                transition: 'all 0.2s ease',
                padding: '8px 16px',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = COLORS.cream;
                e.target.style.background = 'rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(244,237,228,0.55)';
                e.target.style.background = 'transparent';
              }}
            >
              curatorial@arte-facto.mx
            </a>
          </div>

        </div>
      </section>

      {/* CSS para animación de bounce y responsive */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-8px);
          }
          60% {
            transform: translateX(-50%) translateY(-4px);
          }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 900px) {
          .convocatoria-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
