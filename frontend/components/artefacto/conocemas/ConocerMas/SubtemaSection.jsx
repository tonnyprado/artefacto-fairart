'use client';

import { INTRO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * Block - Renderiza un bloque de contenido según su tipo
 */
function Block({ b, introRef }) {
  if (b.type === 'intro') {
    return (
      <p ref={introRef} className={`m-0 ${cls.body}`}>
        {INTRO}
      </p>
    );
  }

  if (b.type === 'etimExtra') {
    return (
      <div className="mb-[9vh]">
        <div className={cls.displayRed}>{b.word}</div>
        <p className={`mt-2 max-w-[280px] ${cls.caption}`}>
          <em>(lat.)</em>
          {b.def.replace('(lat.)', '')}
        </p>
      </div>
    );
  }

  if (b.type === 'h2') {
    return <h2 className={`mb-5 ${cls.h2}`}>{b.text}</h2>;
  }

  if (b.type === 'h3') {
    return <h3 className={`mb-3 ${cls.displayRed}`}>{b.text}</h3>;
  }

  if (b.type === 'kicker') {
    return <div className={`mb-1.5 ${cls.displayRed}`}>{b.text}</div>;
  }

  if (b.type === 'image') {
    return (
      <img
        src={b.src}
        alt={b.alt || ''}
        className="w-full rounded-2xl mt-6 mb-8"
      />
    );
  }

  return (
    <p className={`mb-[6vh] last:mb-0 ${cls.body}`}>
      {b.strongLead ? <strong className="font-bold">{b.strongLead}</strong> : null}
      {b.text}
    </p>
  );
}

/**
 * StickyLabel - Título sticky que se mueve con la sección
 * Se posiciona debajo del LogoMask y empuja al label anterior
 * Empieza oculto (opacity: 0, visibility: hidden) y el JS lo controla
 * Usa constantes CSS compartidas para alineación perfecta con PinnedIntro
 *
 * IMPORTANTE: El JS en index.jsx coordina la visibilidad con los labels apilados
 */
function StickyLabel({ words, sectionId, labelRef, navbarHeight = NAVBAR_HEIGHT }) {
  const handleClick = () => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = navbarHeight + 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div
      ref={labelRef}
      onClick={handleClick}
      data-sticky-label={sectionId}
      className={`sticky z-[11] cursor-pointer bg-crema ${cls.labelW} ${cls.labelPad} ${cls.rule} hover:bg-rojo/10 transition-colors duration-300`}
      style={{
        // Posición sticky: usa la constante compartida para consistencia
        top: CSS.stickyLabelTop(navbarHeight),
        marginLeft: 'calc(-25vw)', // Compensar el ml-[25vw] del section
        marginBottom: '2vh',
        // Estado inicial: oculto (el JS lo muestra cuando el stacked se oculta)
        opacity: 0,
        visibility: 'hidden',
        // Transición suave para opacity controlada por JS
        transition: 'opacity 0.3s ease, background-color 0.3s ease',
      }}
    >
      <div className={cls.labelRow}>
        <span>{words[0]}</span>
        <span>{words[1]}</span>
      </div>
    </div>
  );
}

/**
 * SubtemaSection - Una sección de contenido con su título sticky integrado
 * El título y contenido se mueven juntos como un solo bloque
 */
export default function SubtemaSection({
  data,
  sectionRef = undefined,
  labelRef = undefined,
  introRef,
  minH = 'min-h-[110vh]',
  navbarHeight = NAVBAR_HEIGHT,
}) {
  return (
    <section
      id={data.id}
      ref={sectionRef}
      data-screen-label={data.id}
      className={`ml-[25vw] box-border pt-[11vh] pb-[14vh] pr-[calc(39.5vw+48px)] ${minH}`}
    >
      {/* Título sticky integrado - se mueve con la sección */}
      <StickyLabel
        words={data.words}
        sectionId={data.id}
        labelRef={labelRef}
        navbarHeight={navbarHeight}
      />

      <div className="max-w-[641px]">
        {/* Etimología */}
        <div className="mb-[9vh] flex justify-between gap-10">
          {data.etim.map((e) => (
            <div key={e.word} className="flex-1">
              <div className={cls.displayRed}>{e.word}</div>
              <p className={`mt-2 max-w-[250px] ${cls.caption}`}>{e.def}</p>
            </div>
          ))}
        </div>

        {/* Bloques de contenido */}
        {data.blocks.map((b, i) => (
          <Block
            key={i}
            b={b}
            introRef={b.type === 'intro' ? introRef : undefined}
          />
        ))}
      </div>
    </section>
  );
}
