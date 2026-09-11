// Contenido de la sección CONOCE MÁS
// Ahora usando i18n para traducciones

export const ASSETS = '/assets/conocer-mas';

// Orden del carril derecho de fotos (se repiten para alargar el recorrido)
export const PHOTOS = [
  'photo-2', 'photo-7', 'photo-4', 'photo-5', 'photo-8', 'photo-6', 'photo-9', 'photo-3',
  'photo-4', 'photo-9', 'photo-2', 'photo-6', 'photo-7', 'photo-5', 'photo-8',
].map((n) => `${ASSETS}/${n}.png`);

export const HERO = `${ASSETS}/photo-3.png`;
export const LOGO = `${ASSETS}/logo-red.png`;

// Función para obtener el texto introductorio traducido
export const getIntro = (t) => t('conoceMas.intro');

// Función para obtener el texto de cierre traducido
export const getCierre = (t) => t('conoceMas.cierre');

// Función para obtener el indicador de scroll traducido
export const getScrollIndicator = (t) => t('conoceMas.scrollIndicator');

// Función para construir los SUBTEMAS con traducciones
export const getSubtemas = (t) => [
  {
    id: 'artis-factum',
    words: t('conoceMas.artisFactum.words', { returnObjects: true }),
    etim: [
      {
        word: t('conoceMas.artisFactum.etim.ars.word'),
        def: t('conoceMas.artisFactum.etim.ars.def')
      },
      {
        word: t('conoceMas.artisFactum.etim.factum.word'),
        def: t('conoceMas.artisFactum.etim.factum.def')
      },
    ],
    blocks: [
      {
        type: 'etimExtra',
        word: t('conoceMas.artisFactum.etim.extra.word'),
        def: t('conoceMas.artisFactum.etim.extra.def')
      },
      { type: 'intro' },
    ],
  },
  {
    id: 'pro-positum',
    words: t('conoceMas.proPositum.words', { returnObjects: true }),
    etim: [
      {
        word: t('conoceMas.proPositum.etim.pro.word'),
        def: t('conoceMas.proPositum.etim.pro.def')
      },
      {
        word: t('conoceMas.proPositum.etim.positum.word'),
        def: t('conoceMas.proPositum.etim.positum.def')
      },
    ],
    blocks: [
      { type: 'h2', text: t('conoceMas.proPositum.forjarCultura.title') },
      { type: 'p', text: t('conoceMas.proPositum.forjarCultura.p1') },
      {
        type: 'p',
        strongLead: t('conoceMas.proPositum.forjarCultura.p2Lead'),
        text: t('conoceMas.proPositum.forjarCultura.p2')
      },
    ],
  },
  {
    id: 'dia-gnosis',
    words: t('conoceMas.diaGnosis.words', { returnObjects: true }),
    etim: [
      {
        word: t('conoceMas.diaGnosis.etim.dia.word'),
        def: t('conoceMas.diaGnosis.etim.dia.def')
      },
      {
        word: t('conoceMas.diaGnosis.etim.gnosis.word'),
        def: t('conoceMas.diaGnosis.etim.gnosis.def')
      },
    ],
    blocks: [
      { type: 'h3', text: t('conoceMas.diaGnosis.saberHacer.title') },
      { type: 'p', text: t('conoceMas.diaGnosis.saberHacer.text') },
      { type: 'h3', text: t('conoceMas.diaGnosis.quererHacer.title') },
      { type: 'p', text: t('conoceMas.diaGnosis.quererHacer.text') },
      { type: 'h3', text: t('conoceMas.diaGnosis.elegirHacer.title') },
      { type: 'p', text: t('conoceMas.diaGnosis.elegirHacer.text') },
      { type: 'h3', text: t('conoceMas.diaGnosis.poderHacer.title') },
      { type: 'p', text: t('conoceMas.diaGnosis.poderHacer.text') },
      { type: 'kicker', text: t('conoceMas.diaGnosis.indianilla.kicker') },
      { type: 'h2', text: t('conoceMas.diaGnosis.indianilla.title') },
      { type: 'p', text: t('conoceMas.diaGnosis.indianilla.text') },
      { type: 'image', src: '/assets/conocer-mas/photo-2.png', alt: 'Interior de Estación Indianilla' },
    ],
  },
  {
    id: 'eticas-creativas',
    words: t('conoceMas.eticasCreativas.words', { returnObjects: true }),
    etim: [
      {
        word: t('conoceMas.eticasCreativas.etim.ethos.word'),
        def: t('conoceMas.eticasCreativas.etim.ethos.def')
      },
      {
        word: t('conoceMas.eticasCreativas.etim.creare.word'),
        def: t('conoceMas.eticasCreativas.etim.creare.def')
      },
    ],
    blocks: [
      { type: 'h3', text: t('conoceMas.eticasCreativas.rigor.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.rigor.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.apertura.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.apertura.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.alineacion.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.alineacion.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.transparencia.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.transparencia.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.transmision.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.transmision.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.convivencia.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.convivencia.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.sistema.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.sistema.text') },
      { type: 'h3', text: t('conoceMas.eticasCreativas.autenticidad.title') },
      { type: 'p', text: t('conoceMas.eticasCreativas.autenticidad.text') },
    ],
  },
];
