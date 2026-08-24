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
 * SubtemaSection - Una sección de contenido con su título sticky integrado
 * Usa grid para que el label y contenido estén alineados verticalmente
 * El label está en la columna izquierda (25vw), el contenido en la derecha
 */
export default function SubtemaSection({
  data,
  sectionRef = undefined,
  labelRef = undefined,
  contentRef = undefined,
  introRef,
  minH = 'min-h-[110vh]',
  navbarHeight = NAVBAR_HEIGHT,
}) {
  return (
    <section
      id={data.id}
      ref={sectionRef}
      data-screen-label={data.id}
      className={`grid grid-cols-[25vw_1fr] box-border pb-[14vh] pr-[calc(39.5vw+48px)] ${minH}`}
    >
      {/* Columna izquierda: Label sticky alineado con el contenido */}
      <div className="relative">
        <div
          ref={labelRef}
          data-sticky-label={data.id}
          className={`sticky z-[11] cursor-pointer bg-crema ${cls.labelW} ${cls.labelPad} ${cls.rule} hover:bg-rojo/10 transition-colors duration-300`}
          style={{
            top: CSS.stickyLabelTop(navbarHeight),
            // Estado inicial: oculto (el JS lo muestra cuando el stacked se oculta)
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.3s ease, background-color 0.3s ease',
          }}
        >
          <div className={cls.labelRow}>
            <span>{data.words[0]}</span>
            <span>{data.words[1]}</span>
          </div>
        </div>
      </div>

      {/* Columna derecha: Contenido con padding-top para alinearse con el sticky label */}
      <div
        ref={contentRef}
        className="max-w-[641px]"
        style={{ paddingTop: CSS.stickyLabelTop(navbarHeight) }}
      >
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
