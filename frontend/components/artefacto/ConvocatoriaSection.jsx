'use client';
import { useState } from 'react';
import { COLORS, FONTS, container } from './theme';
import { useTextScramble } from './useTextScramble';
import TransitionLink from './TransitionLink';

// Datos del contenido
const CONTENIDO = {
  laFeria: [
    'ARTE FACTO | Éticas Creativas es un proyecto cultural a largo plazo: un catalizador de proyectos de arte y disciplinas creativas.',
    'Buscamos forjar cultura y sembrar una comunidad de creadores apasionados por la praxis artística.',
    'Aquí lo conceptual y lo técnico ponderan por igual — vengas de la figuración, la abstracción o cualquier territorio intermedio.',
    'Valoramos el camino de tu práctica: el arte al que has llegado con trabajo, atención y convicción.',
    'No es una feria de stands: es una exposición híbrida e integral, al estilo salón, con curaduría rigurosa.',
  ],
  comoPostular: [
    'Regístrate en arte-facto.mx/#convocatoria — el registro es gratuito.',
    'Solo cubres el costo de tu paquete si resultas seleccionado.',
    'En Tu Lienzo eliges tu paquete, cargas tus obras con ficha técnica y propones su acomodo.',
    'Tú pones el precio de tu obra; la interfaz calcula las comisiones automáticamente.',
    'Convocatoria abierta del 17 de agosto al 10 de noviembre de 2026, en tres fases.',
  ],
  requisitos: [
    'Mayores de 18 años, emergentes o consolidados, con o sin estudios en artes visuales.',
    'Nacionalidad mexicana o extranjera, sin necesidad de residir en México.',
    'Postulación individual o colectiva.',
    'Medios: pintura, acuarela, dibujo, escultura, gráfica, fotografía, cerámica, collage & mixta, textil.',
    'Sin mínimo ni máximo de obras: incluye tantas como quepan en tu paquete.',
  ],
  seleccion: [
    'El Comité Curatorial define la selección y el orden conceptual — formato salón, no stands.',
    'Se elegirán de 11 a 18 artistas por fase. No seleccionados siguen en concurso.',
    'Espacio expositivo gratuito para 5–10 artistas mediante concurso.',
    'Tu paquete incluye montaje, asesores de venta, catálogo digital, difusión y más.',
  ],
  fechas: [
    { titulo: 'Fases', texto: 'I: 17 ago – 7 sept (−20%) · II: 18 sept – 9 oct (−10%) · III: 20 oct – 10 nov.' },
    { titulo: 'Resultados', texto: '17 sept · 19 oct · 20 nov 2026.' },
    { titulo: 'La feria', texto: '4 al 7 de febrero de 2027, Estación Indianilla, CDMX.' },
  ],
};

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
function HoverButton({ href, bg, color, hoverBg, hoverColor, children, download, external, isTransitionLink, ...props }) {
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    background: isHovered ? hoverBg : bg,
    color: isHovered ? hoverColor : color,
    padding: '16px 28px',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 12,
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
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

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
}

export default function ConvocatoriaSection({ edicion = '2027', abierta = true, urlRegistro = '/registro' }) {
  const titleScramble = useTextScramble('Convocatoria Abierta', {
    duration: 1200,
    delay: 400,
  });

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
            Edición II
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
            Feria de arte independiente en formato salón:
          </p>
          <p style={{
            margin: '0 0 16px',
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            lineHeight: 1.5,
            color: 'rgba(244,237,228,0.75)',
            fontFamily: FONTS.body,
            fontStyle: 'italic',
          }}>
            ~50 artistas, un solo proyecto curatorial.
          </p>
          <p style={{
            margin: 0,
            fontSize: 'clamp(13px, 1.5vw, 15px)',
            lineHeight: 1.5,
            color: 'rgba(244,237,228,0.65)',
            fontFamily: FONTS.body,
            letterSpacing: '0.02em',
          }}>
            4 al 7 de febrero de 2027 · Centro Cultural Estación Indianilla, CDMX.
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
            Para conocer todos los detalles:
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <HoverButton
              href="/pdfs/Convocatoria_ARTEFACTO.pdf"
              bg={COLORS.cream}
              color={COLORS.black}
              hoverBg={COLORS.black}
              hoverColor={COLORS.cream}
              download
              external
            >
              Descarga la convocatoria — PDF
            </HoverButton>
            {abierta && (
              <HoverButton
                href={urlRegistro}
                bg={COLORS.black}
                color={COLORS.cream}
                hoverBg={COLORS.cream}
                hoverColor={COLORS.black}
                isTransitionLink
              >
                Regístrate aquí →
              </HoverButton>
            )}
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
              {CONTENIDO.laFeria.map((item, i) => (
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
                {CONTENIDO.comoPostular.map((item, i) => (
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
                {CONTENIDO.requisitos.map((item, i) => (
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
                {CONTENIDO.seleccion.map((item, i) => (
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
              {CONTENIDO.fechas.map((item, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(244,237,228,0.85)',
                }}>
                  <strong style={{ color: COLORS.cream }}>{item.titulo}:</strong> {item.texto}
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
                href="/pdfs/Convocatoria_ARTEFACTO.pdf"
                bg={COLORS.cream}
                color={COLORS.black}
                hoverBg={COLORS.black}
                hoverColor={COLORS.cream}
                download
                external
              >
                Descargar convocatoria — PDF
              </HoverButton>
              <HoverButton
                href={urlRegistro}
                bg={COLORS.black}
                color={COLORS.cream}
                hoverBg={COLORS.cream}
                hoverColor={COLORS.black}
                isTransitionLink
              >
                {abierta ? 'Iniciar mi registro →' : 'Inscripciones Cerradas'}
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
