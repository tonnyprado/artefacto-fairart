import Foto from './Foto';
import MobFase from './MobFase';
import FormOpinion from './FormOpinion';
import { CardTestimonioMobile } from './CardTestimonio';

/**
 * ConoceMasMobile - Layout móvil para la sección CONOCE MÁS
 *
 * Composición vertical optimizada para dispositivos móviles.
 * Especificaciones: lienzo 1289px, margen 23, gap 35, fondo #DDD3D3
 * Visible solo en pantallas menores o iguales a 1200px.
 *
 * TARJETAS INCLUIDAS (Mobile):
 * - M1: CardLogoMobile + CardFeriaFechasMobile
 * - M2: CardFotoGaleriaMobile + CardIntroMobile + CardManifiestoMobile
 * - M3: CardModeloHibridoMobile
 * - M4: CardFotoSedeMobile
 * - M5: CardCuradurialMobile
 * - M6: CardFasesMobile + CardMapaMobile
 * - M7: CardFotoObraMobile + CardPaquetesMobile + CardConsultaMobile
 * - M8: CardFormularioMobile
 * - M9: CardTestimonioMobile
 */
export default function ConoceMasMobile() {
  return (
    <div className="mx-auto hidden max-w-[760px] flex-col gap-[2.7cqw] px-[2.7cqw] pb-[2.7cqw] max-[1200px]:flex">
      {/* M1: CardLogoMobile + CardFeriaFechasMobile */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-[2.7cqw]">
        {/* CardLogoMobile */}
        <div className="relative aspect-[774/539] overflow-hidden rounded-[5.3cqw] bg-rojo">
          <img
            src="/assets/artefacto-logo.svg"
            alt="ARTE FACTO — Éticas Creativas"
            className="absolute left-1/2 top-1/2 w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        {/* CardFeriaFechasMobile */}
        <div className="flex flex-col justify-center rounded-[5.3cqw] bg-rojo px-[3cqw] py-[3.4cqw] text-white">
          <p className="text-justify text-[3.9cqw] font-bold leading-[1.1]">
            Feria de arte Edición&nbsp;&nbsp;II
          </p>
          <p className="mt-[.15em] text-justify text-[3.9cqw] font-bold leading-[1.05]">
            Semana del arte
          </p>
          <p className="mt-[.2em] text-justify font-serif italic text-[3.9cqw] leading-[1.08]">
            Ciudad&nbsp;&nbsp;de México
          </p>
          <p className="mt-[.2em] flex justify-between text-[3.5cqw] font-bold leading-[1.05]">
            <span>4</span>
            <span>-</span>
            <span>7</span>
          </p>
          <p className="mt-[.1em] text-justify text-[3.3cqw] font-bold leading-[1.05]">
            febrero&nbsp;&nbsp;2027
          </p>
        </div>
      </div>

      {/* M2: CardFotoGaleriaMobile + CardIntroMobile | CardManifiestoMobile */}
      <div className="grid grid-cols-[430fr_765fr] gap-[2.7cqw]">
        <div className="flex flex-col gap-[2.7cqw]">
          {/* CardFotoGaleriaMobile */}
          <Foto
            src="/assets/foto-galeria.jpg"
            alt="Montaje en galería"
            className="aspect-[430/539] rounded-[5.1cqw]"
          />
          {/* CardIntroMobile */}
          <div className="flex flex-1 flex-col justify-center rounded-[5.1cqw] bg-rojo px-[3cqw] py-[3.4cqw] text-white">
            <p className="text-justify text-[3.5cqw] font-bold leading-[1.18]">
              Para nuestro próximo proyecto en puerta, presentamos la feria
            </p>
            <p className="mt-[.4em] text-justify font-serif italic text-[3.6cqw] leading-[1.15]">
              con enfoque en artes visuales.
            </p>
          </div>
        </div>
        {/* CardManifiestoMobile */}
        <div className="flex flex-col justify-center gap-[3.4cqw] rounded-[9.8cqw] bg-white px-[5cqw] py-[5.5cqw]">
          <p className="text-justify text-[3.9cqw] font-bold leading-[1.25]">
            Es un proyecto cultural que fomenta las disciplinas creativas
            diversas, para enriquecer y forjar la cultura de las artes
            universales.
          </p>
          <p className="text-justify text-[4.4cqw] font-bold leading-[1.2] text-rojo">
            Aquí nos planteamos: ¿Qué significa hacer en el contexto cultural de
            hoy?
          </p>
          <p className="text-center font-serif italic text-[8.2cqw] leading-[1.25]">
            Querer hacer, poder hacer, elegir hacer, saber hacer.
          </p>
        </div>
      </div>

      {/* M3: CardModeloHibridoMobile */}
      <div className="flex flex-col gap-[2.7cqw] rounded-[9cqw] bg-white px-[5cqw] py-[4.4cqw]">
        <p className="text-justify text-[3.9cqw] font-bold leading-[1.28]">
          <strong className="font-extrabold">ARTE FACTO</strong> plantea un
          modelo híbrido de feria, en el que la selección de artistas es
          resultado de un proceso curatorial, a través del cual, una vez
          seleccionado el artista, adquiere un paquete de metraje* para exponer
          su cuerpo de obra personal. Posteriormente, nuestro{' '}
          <strong className="font-extrabold">Comité Curatorial</strong>{' '}
          <span className="block text-center">resuelve la muestra en</span>
        </p>
        <div className="mx-auto w-[87%] rounded-[4.4cqw] bg-rojo px-[3cqw] py-[1.6cqw] text-center text-white">
          <p className="text-[3.5cqw] font-semibold leading-[1.2]">
            formato de{' '}
            <em className="font-serif text-[1.24em] font-normal italic">
              salón&nbsp;&nbsp;o galería.
            </em>
          </p>
        </div>
      </div>

      {/* M4: CardFotoSedeMobile */}
      <Foto
        src="/assets/feria-nave.jpg"
        alt="Nave industrial — sede de la feria"
        className="aspect-[1243/767] rounded-[5.3cqw]"
      />

      {/* M5: CardCuraduriaMobile */}
      <div className="flex flex-col justify-center gap-[1.6cqw] rounded-[8.9cqw] bg-azul px-[5cqw] py-[4.4cqw] text-white">
        <p className="text-justify text-[6.3cqw] font-bold leading-[1.08]">
          Exposición con curaduría{' '}
          <span className="font-serif font-medium">&amp;</span>{' '}
          museografía&nbsp;&nbsp;rigurosa.
        </p>
        <p className="text-justify font-serif italic text-[5.35cqw] leading-[1.12]">
          Generada por un comité curatorial, a lo largo de una convocatoria
          abierta de 3 fases, extendiéndose desde agosto a noviembre del 2026.
        </p>
      </div>

      {/* M6: CardFasesMobile | CardMapaMobile */}
      <div className="grid grid-cols-[418fr_779fr] gap-[2.7cqw]">
        {/* CardFasesMobile */}
        <div className="flex flex-col gap-[2.7cqw]">
          <MobFase numero="I" color="bg-rojo">
            <p className="mt-[.2em] flex justify-between font-serif italic text-[3.5cqw]">
              <span>Del</span>
              <span>15-31</span>
              <span>ago</span>
            </p>
          </MobFase>
          <MobFase numero="II" color="bg-azul">
            <p className="mt-[.2em] font-serif italic text-[3.5cqw]">
              Del 15 sep al 03 oct
            </p>
            <p className="mt-[.25em] text-center text-[3.1cqw] font-bold leading-[1.15]">
              Apertura próximamente
            </p>
          </MobFase>
          <MobFase numero="III" color="bg-azul">
            <p className="mt-[.2em] font-serif italic text-[3.5cqw]">
              Del 18 oct al 10 nov
            </p>
            <p className="mt-[.25em] text-center text-[3.1cqw] font-bold leading-[1.15]">
              Apertura próximamente
            </p>
          </MobFase>
        </div>
        {/* CardMapaMobile */}
        <div className="flex flex-col gap-[2.7cqw] rounded-[8.5cqw] bg-azul p-[2.7cqw] text-white">
          <Foto
            src="/assets/mapa-circuito.png"
            alt="Mapa del circuito"
            className="aspect-[725/500] flex-1 rounded-[5.8cqw] bg-white"
          />
          <div className="px-[1.6cqw] pb-[1.6cqw] text-center">
            <p className="text-[3.5cqw] font-bold leading-[1.2]">
              Gran cercanía en el circuito:
            </p>
            <p className="mt-[.1em] font-serif italic text-[3.5cqw] leading-[1.2]">
              Centro Cultural Estación Indianilla
            </p>
            <p className="mt-[.15em] text-[3.5cqw] font-bold leading-[1.2]">
              Ubicado en colonia Doctores. A 15 minutos caminando de otros
              eventos y galerías.
            </p>
          </div>
        </div>
      </div>

      {/* M7: CardFotoObraMobile | CardPaquetesMobile + CardConsultaMobile */}
      <div className="grid grid-cols-[802fr_402fr] gap-[2.7cqw]">
        {/* CardFotoObraMobile */}
        <Foto
          src="/assets/foto-obra.jpg"
          alt="Obra — pintura"
          className="aspect-[802/1053] rounded-[9.7cqw]"
        />
        <div className="flex flex-col gap-[2.7cqw]">
          {/* CardPaquetesMobile */}
          <div className="flex flex-1 flex-col justify-center gap-[1.6cqw] rounded-[4.6cqw] bg-white p-[3cqw] text-center text-rojo">
            <p className="text-[3.9cqw] font-extrabold leading-[1.2]">
              Paquetes para artistas desde:
            </p>
            <p className="text-[5.9cqw] font-extrabold leading-none">
              5,200
              <span className="font-serif text-[.6em] font-medium italic">
                MXN
              </span>
            </p>
          </div>
          {/* CardConsultaMobile */}
          <div className="flex flex-1 flex-col justify-center gap-[1cqw] rounded-[4.6cqw] border-[1.16cqw] border-rojo p-[3cqw] text-center">
            <p className="text-[3.9cqw] font-extrabold leading-[1.2]">
              Consulta la convocatoria
            </p>
            <a
              href="#convocatoria"
              className="text-[6.5cqw] font-extrabold underline underline-offset-2 hover:opacity-75"
            >
              AQUÍ
            </a>
          </div>
        </div>
      </div>

      {/* M8: CardFormularioMobile */}
      <FormOpinion
        className="rounded-[4.6cqw] px-[3.9cqw] py-[3.4cqw] gap-[2.2cqw]"
        titleCls="text-[4.4cqw]"
        subCls="text-[3.5cqw]"
        inputCls="px-[3.4cqw] py-[1.7cqw] text-[3.3cqw]"
        gapCls="gap-[2.2cqw]"
      />

      {/* M9: CardTestimonioMobile - Testimonio dinámico */}
      <CardTestimonioMobile />
    </div>
  );
}
