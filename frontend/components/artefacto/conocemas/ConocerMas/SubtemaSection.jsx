'use client';

import { INTRO } from './content';
import { cls } from './classes';

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
 * SubtemaSection - Una sección con subtema sticky
 * Fila de grid: celda izquierda con el subtema sticky
 * + celda central con etimología y bloques de contenido
 */
export default function SubtemaSection({
  data,
  labelRef,
  introRef,
  minH = 'min-h-[110vh]',
}) {
  return (
    <section
      data-screen-label={data.id}
      className={`grid grid-cols-[25vw_1fr] box-border pt-[11vh] pb-[14vh] pr-[calc(39.5vw+48px)] ${minH}`}
    >
      {/* La celda se extiende más allá de la fila para que el subtema saliente
          permanezca fijo hasta que el entrante lo alcance y lo empuje */}
      <div style={{ height: 'calc(100% + 25vh + 250px)' }}>
        <div
          data-sublabel
          ref={labelRef}
          className={`sticky box-border ${cls.pinTop} ${cls.labelW} ${cls.labelPad} ${cls.rule}`}
        >
          <div className={cls.labelRow}>
            <span>{data.words[0]}</span>
            <span>{data.words[1]}</span>
          </div>
        </div>
      </div>

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
