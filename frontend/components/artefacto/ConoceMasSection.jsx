'use client';

import ConoceMasDesktop from './conocemas/ConoceMasDesktop';
import ConoceMasMobile from './conocemas/ConoceMasMobile';

/**
 * ConoceMasSection - Sección principal "CONOCE MÁS" de ARTE FACTO
 *
 * Sección tipo bento grid con dos composiciones responsivas:
 * - Desktop (>1200px): retícula 5×10, fondo #EAEAEA (gris)
 * - Móvil (≤1200px): composición vertical, fondo #DDD3D3 (rosa)
 *
 * Usa container queries (cqw) para escalado proporcional.
 *
 * COMPONENTES HIJOS:
 * - ConoceMasDesktop: Layout de escritorio con grid 5×10
 * - ConoceMasMobile: Layout móvil con composición vertical
 *
 * TARJETAS DOCUMENTADAS (ver cada componente para detalles):
 *
 * DESKTOP:
 * - CardIntro: Texto introductorio rojo
 * - CardLogo: Logo ARTE FACTO
 * - CardManifiesto: Manifiesto del proyecto
 * - CardEdicion: Feria de arte Edición II
 * - CardModeloHibrido: Descripción del modelo híbrido
 * - CardFotoSede: Foto nave industrial
 * - CardCiudadFechas: Ciudad de México y fechas
 * - CardCuraduria: Información de curaduría
 * - CardMapa: Mapa del circuito
 * - CardFotoGaleria: Foto montaje en galería
 * - CardFaseI/II/III: Fases de la convocatoria
 * - CardConsulta: Botón consulta convocatoria
 * - CardFotoObra: Foto de obra/pintura
 * - CardTestimonio: Testimonio "Fulanito"
 * - CardPaquetes: Precios desde 5,200 MXN
 * - CardFormulario: Formulario de opinión
 *
 * MÓVIL (M1-M9):
 * - M1: CardLogoMobile + CardFeriaFechasMobile
 * - M2: CardFotoGaleriaMobile + CardIntroMobile + CardManifiestoMobile
 * - M3: CardModeloHibridoMobile
 * - M4: CardFotoSedeMobile
 * - M5: CardCuraduriaMobile
 * - M6: CardFasesMobile + CardMapaMobile
 * - M7: CardFotoObraMobile + CardPaquetesMobile + CardConsultaMobile
 * - M8: CardFormularioMobile
 * - M9: CardTestimonioMobile
 *
 * TIPOGRAFÍAS REQUERIDAS (cargar en index.html o layout):
 * - Inter Tight: 400, 600, 700, 800 (itálica: 600)
 * - EB Garamond: 400, 500 (itálica: 400, 500, 600)
 *
 * @see ConoceMasDesktop
 * @see ConoceMasMobile
 */
export default function ConoceMasSection() {
  return (
    <section
      id="conoce-mas"
      className="bg-gris pt-24 font-sans text-black [container-type:inline-size] max-[1200px]:bg-rosa max-[1200px]:pt-20"
    >
      <ConoceMasDesktop />
      <ConoceMasMobile />
    </section>
  );
}
