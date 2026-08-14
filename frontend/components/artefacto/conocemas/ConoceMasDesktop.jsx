import { g } from './gridHelper';
import Foto from './Foto';
import DeskFase from './DeskFase';
import FormOpinion from './FormOpinion';
import CardTestimonio from './CardTestimonio';

/**
 * ConoceMasDesktop - Layout de escritorio para la sección CONOCE MÁS
 *
 * Retícula de 5 columnas × 10 filas con diseño bento grid.
 * Especificaciones: celda 326×260, gap 33, lienzo 1920px, fondo #EAEAEA
 * Oculto en pantallas menores a 1200px.
 *
 * TARJETAS INCLUIDAS:
 * - CardIntro: Texto introductorio rojo (col 1, filas 1-2)
 * - CardLogo: Logo ARTE FACTO (cols 2-3, filas 1-2)
 * - CardManifiesto: Manifiesto del proyecto (cols 4-5, filas 1-2)
 * - CardEdicion: Feria de arte Edición II (col 1, fila 3)
 * - CardModeloHibrido: Descripción del modelo (col 2, filas 3-4)
 * - CardFotoSede: Foto nave industrial (cols 3-5, filas 3-4)
 * - CardCiudadFechas: Ciudad de México y fechas (col 1, fila 4)
 * - CardCuraduria: Información de curaduría (cols 1-2, fila 5)
 * - CardMapa: Mapa del circuito (cols 3-5, filas 5-6)
 * - CardFotoGaleria: Foto montaje en galería (cols 1-2, filas 6-7)
 * - CardFaseI/II/III: Fases de la convocatoria (cols 3-5, fila 7)
 * - CardConsulta: Botón consulta convocatoria (col 1, fila 8)
 * - CardFotoObra: Foto de obra/pintura (cols 2-3, filas 8-9)
 * - CardTestimonio: Testimonio "Fulanito" (cols 4-5, filas 8-10)
 * - CardPaquetes: Precios desde 5,200 MXN (col 1, fila 9)
 * - CardFormulario: Formulario de opinión (cols 1-3, fila 10)
 */
export default function ConoceMasDesktop() {
  return (
    <div className="mx-auto max-w-[1920px] px-[2.5cqw] pb-[2.5cqw] max-[1200px]:hidden">
      <div className="grid aspect-[1838/2969] grid-cols-5 grid-rows-[repeat(10,1fr)] gap-[1.72cqw]">
        {/* CardIntro - Texto introductorio */}
        <div
          style={g(1, 2, 1, 3)}
          className="rounded-[2.72cqw] bg-rojo p-[2.2cqw] text-white"
        >
          <p className="text-justify text-[2.42cqw] font-bold leading-[1.12]">
            Para nuestro próximo proyecto en puerta, presentamos la&nbsp;&nbsp;&nbsp;&nbsp;feria{' '}
            <em className="font-serif font-medium italic">
              con enfoque en las artes visuales.
            </em>
          </p>
        </div>

        {/* CardLogo - Logo ARTE FACTO */}
        <div
          style={g(2, 4, 1, 3)}
          className="relative overflow-hidden rounded-[2.72cqw] bg-rojo"
        >
          <img
            src="/assets/artefacto-logo.svg"
            alt="ARTE FACTO — Éticas Creativas"
            className="absolute left-1/2 top-1/2 w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {/* CardManifiesto - Manifiesto del proyecto */}
        <div
          style={g(4, 6, 1, 3)}
          className="flex flex-col justify-center gap-[1.3cqw] rounded-[2.72cqw] bg-white p-[2.4cqw]"
        >
          <p className="text-justify text-[1.5cqw] font-bold leading-[1.4]">
            Es un proyecto cultural que fomenta las disciplinas creativas
            diversas, para enriquecer y forjar la cultura de las artes
            universales.
          </p>
          <p className="text-justify text-[2.1cqw] font-bold leading-[1.25] text-rojo">
            Creemos y nos planteamos: ¿Qué significa hacer en el contexto
            cultural de hoy?
          </p>
          <p className="font-serif italic text-[2.65cqw] leading-[1.15]">
            Querer hacer, poder hacer, elegir hacer, saber hacer.
          </p>
        </div>

        {/* CardEdicion - Feria de arte Edición II */}
        <div
          style={g(1, 2, 3, 4)}
          className="flex flex-col justify-center rounded-[2.72cqw] bg-azul p-[1.7cqw] text-white"
        >
          <p className="text-justify text-[2.18cqw] font-bold leading-[1.1]">
            Feria de arte Edición&nbsp;&nbsp;&nbsp;&nbsp;II
          </p>
          <p className="mt-[.3em] text-justify text-[2.18cqw] font-bold leading-[1.05] text-azulclaro">
            Semana del&nbsp;&nbsp;arte
          </p>
        </div>

        {/* CardModeloHibrido - Descripción del modelo híbrido */}
        <div
          style={g(2, 3, 3, 5)}
          className="flex flex-col rounded-[2.72cqw] bg-white p-[1.55cqw]"
        >
          <p className="text-justify text-[1.28cqw] font-semibold leading-[1.3]">
            <strong className="font-extrabold">ARTE FACTO</strong> plantea un
            modelo híbrido de feria, en el que la selección de artistas es
            resultado de un proceso curatorial, a través del cual, una vez
            seleccionado el artista, adquiere un paquete de metraje* para
            exponer su cuerpo de obra personal.
            Posteriormente,&nbsp;&nbsp;nuestro
          </p>
          <p className="text-[1.63cqw] font-extrabold leading-[1.25]">
            Comité Curatorial
          </p>
          <p className="text-center text-[1.28cqw] font-semibold leading-[1.3]">
            resuelve la muestra en
          </p>
          <div className="mt-auto rounded-[1.42cqw] bg-rojo px-[1cqw] py-[.65cqw] text-center text-white">
            <p className="text-[.95cqw] font-semibold">formato de</p>
            <p className="font-serif italic leading-[1.1] text-[1.5cqw]">
              salón&nbsp;&nbsp;o galería.
            </p>
          </div>
        </div>

        {/* CardFotoSede - Foto nave industrial */}
        <Foto
          src="/assets/feria-nave.jpg"
          alt="Nave industrial — sede de la feria"
          style={g(3, 6, 3, 5)}
          className="rounded-[2.72cqw]"
        />

        {/* CardCiudadFechas - Ciudad de México y fechas */}
        <div
          style={g(1, 2, 4, 5)}
          className="flex flex-col justify-center rounded-[2.72cqw] bg-azul p-[1.7cqw] text-white"
        >
          <p className="text-justify font-serif italic text-[2.65cqw] leading-[1.08]">
            Ciudad&nbsp;&nbsp;de México
          </p>
          <p className="mt-[.25em] flex justify-between text-[2.1cqw] font-bold leading-[1.05] text-azulclaro">
            <span>4</span>
            <span>-</span>
            <span>7</span>
          </p>
          <p className="mt-[.1em] text-justify text-[1.75cqw] font-bold leading-[1.05] text-azulclaro">
            febrero&nbsp;&nbsp;2027
          </p>
        </div>

        {/* CardCuraduria - Información de curaduría */}
        <div
          style={g(1, 3, 5, 6)}
          className="flex flex-col justify-center rounded-[2.72cqw] bg-rojo p-[1.6cqw] text-white"
        >
          <p className="text-justify text-[1.98cqw] font-bold leading-[1.14]">
            La exposición se ejecutará con una curaduría{' '}
            <span className="font-serif font-medium">&amp;</span> museografía
            rigurosa.
          </p>
          <p className="mt-[.4em] text-justify font-serif italic text-[1.85cqw] leading-[1.12]">
            Generada por un Comité Curatorial, a lo largo de una convocatoria
            abierta de 3 fases, extendiéndose desde el mes de agosto a noviembre
            del 2026.
          </p>
        </div>

        {/* CardMapa - Mapa del circuito */}
        <div
          style={g(3, 6, 5, 7)}
          className="grid grid-cols-[1fr_1.9fr] gap-[1.4cqw] rounded-[2.72cqw] bg-azul p-[1.4cqw] text-white"
        >
          <div className="flex flex-col justify-center gap-[1.2cqw] text-center">
            <p className="text-[1.9cqw] font-bold leading-[1.15]">
              Gran cercanía en el circuito:
            </p>
            <p className="font-serif text-[1.9cqw] leading-[1.15]">
              Centro Cultural{' '}
              <em className="block text-[1.2em]">Estación Indianilla</em>
            </p>
            <p className="text-[1.7cqw] font-bold leading-[1.25]">
              Se encuentra en Colonia Doctores. A solo 15 minutos a pie de
              grandes eventos, ferias y galerías.
            </p>
          </div>
          <Foto
            src="/assets/mapa-circuito.png"
            alt="Mapa del circuito"
            className="rounded-[1.9cqw] bg-white"
          />
        </div>

        {/* CardFotoGaleria - Foto montaje en galería */}
        <Foto
          src="/assets/foto-galeria.jpg"
          alt="Montaje en galería"
          style={g(1, 3, 6, 8)}
          className="rounded-[2.72cqw]"
        />

        {/* CardFaseI/II/III - Fases de la convocatoria */}
        <DeskFase col={3} numero="I" fechas="Del 15-31 ago" abierta />
        <DeskFase col={4} numero="II" fechas="15 sep al 03 oct" />
        <DeskFase col={5} numero="III" fechas="Del 15-31 agosto" />

        {/* CardConsulta - Consulta la convocatoria */}
        <div
          style={g(1, 2, 8, 9)}
          className="flex flex-col items-center justify-center gap-[.6cqw] rounded-[2.72cqw] border-[.49cqw] border-rojo bg-gris p-[1.5cqw] text-center"
        >
          <p className="text-[2cqw] font-extrabold leading-[1.15]">
            Consulta la convocatoria
          </p>
          <a
            href="#convocatoria"
            className="text-[1.85cqw] font-extrabold text-rojo underline underline-offset-2 hover:opacity-75"
          >
            AQUÍ
          </a>
        </div>

        {/* CardFotoObra - Foto de obra/pintura */}
        <Foto
          src="/assets/foto-obra.jpg"
          alt="Obra — pintura"
          style={g(2, 4, 8, 10)}
          className="rounded-[2.72cqw]"
        />

        {/* CardTestimonio - Testimonio dinámico */}
        <CardTestimonio style={g(4, 6, 8, 11)} />

        {/* CardPaquetes - Precios de paquetes */}
        <div
          style={g(1, 2, 9, 10)}
          className="flex flex-col justify-center gap-[.4cqw] rounded-[2.72cqw] bg-white p-[1.5cqw] text-center text-rojo"
        >
          <p className="text-[1.95cqw] font-extrabold leading-[1.15]">
            Paquetes para artistas desde:
          </p>
          <p className="text-[3.48cqw] font-extrabold leading-none">
            5,200
            <span className="font-serif text-[.62em] font-medium italic">
              MXN
            </span>
          </p>
        </div>

        {/* CardFormulario - Formulario de opinión */}
        <FormOpinion
          style={g(1, 4, 10, 11)}
          className="rounded-[2.72cqw] px-[2.3cqw] py-[1.6cqw] gap-[1cqw]"
          titleCls="text-[2.4cqw]"
          subCls="text-[1.9cqw]"
          inputCls="px-[1.5cqw] py-[.85cqw] text-[1.6cqw]"
          gapCls="gap-[1cqw]"
        />
      </div>
    </div>
  );
}
