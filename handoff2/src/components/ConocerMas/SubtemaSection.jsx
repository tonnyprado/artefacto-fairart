import { INTRO } from '../../data/content';
import { cls } from './classes';

function Block({ b, introRef }) {
  if (b.type === 'intro') return <p ref={introRef} className={`m-0 ${cls.body}`}>{INTRO}</p>;
  if (b.type === 'etimExtra') {
    return (
      <div className="mb-[9vh]">
        <div className={cls.etim}>{b.word}</div>
        <p className={`mt-2 max-w-[280px] ${cls.caption}`}><em>(lat.)</em>{b.def.replace('(lat.)', '')}</p>
      </div>
    );
  }
  if (b.type === 'h2') return <h2 className={`mb-5 ${cls.h2}`}>{b.text}</h2>;
  if (b.type === 'h3') return <h3 className={`mb-3 ${cls.etim}`}>{b.text}</h3>;
  if (b.type === 'kicker') return <div className={`mb-1.5 ${cls.kicker}`}>{b.text}</div>;
  return (
    <p className={`mb-[6vh] last:mb-0 ${cls.body}`}>
      {b.strongLead ? <strong>{b.strongLead}</strong> : null}
      {b.text}
    </p>
  );
}

// Sección de subtema: SOLO contenido. El label vive fuera (fixed, lo mueve el
// hook); la celda izquierda del grid queda vacía a propósito.
export default function SubtemaSection({ data, contentRef, introRef, minH = '' }) {
  return (
    <section className={`grid grid-cols-[25vw_1fr] box-border pt-[11vh] pb-[14vh] pr-[calc(39.5vw+48px)] ${minH}`}>
      <div></div>
      <div ref={contentRef} className="max-w-[641px]">
        <div className="mb-[9vh] flex justify-between gap-10">
          {data.etim.map((e) => (
            <div key={e.word} className="flex-1">
              <div className={cls.etim}>{e.word}</div>
              <p className={`mt-2 max-w-[250px] ${cls.caption}`}>{e.def}</p>
            </div>
          ))}
        </div>
        {data.blocks.map((b, i) => <Block key={i} b={b} introRef={b.type === 'intro' ? introRef : undefined} />)}
      </div>
    </section>
  );
}
