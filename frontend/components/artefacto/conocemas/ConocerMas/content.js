// Contenido de la sección CONOCE MÁS
// Basado en el handoff aprobado

export const ASSETS = '/assets/conocer-mas';

// Orden del carril derecho de fotos (se repiten para alargar el recorrido)
export const PHOTOS = [
  'photo-2', 'photo-7', 'photo-4', 'photo-5', 'photo-8', 'photo-6', 'photo-9', 'photo-3',
  'photo-4', 'photo-9', 'photo-2', 'photo-6', 'photo-7', 'photo-5', 'photo-8',
].map((n) => `${ASSETS}/${n}.png`);

export const HERO = `${ASSETS}/photo-3.png`;
export const LOGO = `${ASSETS}/logo-red.png`;

// Párrafo que se fija junto al logo (manifiesto)
export const INTRO = 'Somos una feria de arte independiente que trabaja directo con el artista, sin galerías de por medio. Reunimos a cerca de 50 creadores nacionales e internacionales bajo una curaduría que pesa la técnica y el concepto por igual. Funcionamos como salón y no como feria de stands: una sola narrativa visual, construida por un comité curatorial que busca los diálogos entre las obras. Nos montamos durante la Semana del Arte de la Ciudad de México.';

export const SUBTEMAS = [
  {
    id: 'artis-factum',
    words: ['ARTIS', 'FACTUM'],
    etim: [
      { word: 'ars/artis', def: '(lat.) habilidad, oficio o técnica aprendida a través de la práctica.' },
      { word: 'factum/factus', def: '(lat.) lo hecho, lo fabricado.' },
    ],
    blocks: [
      { type: 'etimExtra', word: 'arte factum', def: '(lat.) Confeccionado con técnica y hecho con arte.' },
      { type: 'intro' },
    ],
  },
  {
    id: 'pro-positum',
    words: ['PRO', 'PÓSITUM'],
    etim: [
      { word: 'pro', def: '(lat.) delante, al frente, a la vista de todos.' },
      { word: 'pósitum', def: '(lat.) lo puesto, lo colocado.' },
    ],
    blocks: [
      { type: 'h2', text: 'FORJAR CULTURA' },
      { type: 'p', text: 'Forjar es dar forma con calor y golpe: donde alguien insiste y alguien aprende. El calor es el concepto y el golpe es la técnica. La cultura es materia al rojo vivo, en constante transformación, que toma la forma de quienes hacen y enseñan.' },
      { type: 'p', strongLead: 'ARTE FACTO', text: ' es para artistas cuyo concepto y técnica se desarrollan con el mismo rigor — donde uno no existe sin el otro. Aquí, lo conceptual y lo técnico ponderan en un mismo nivel, vengas de la figuración, la abstracción o cualquier territorio intermedio, con estudios o años de prueba y error. Valoramos el camino que haya seguido tu práctica: es la construcción del arte al que has llegado con trabajo, atención y convicción.' },
    ],
  },
  {
    id: 'dia-gnosis',
    words: ['DIÁ', 'GNŌSIS'],
    etim: [
      { word: 'diá', def: '(gr.) a través de, por medio de.' },
      { word: 'gnōsis', def: '(gr.) conocimiento.' },
    ],
    blocks: [
      { type: 'h3', text: 'i. saber hacer' },
      { type: 'p', text: 'En un contexto donde cada vez somos más artistas, las herramientas y el conocimiento técnico con los que producimos son de suma importancia para comunicar y expresar nuestras intenciones creativas y artísticas.' },
      { type: 'h3', text: 'ii. querer hacer' },
      { type: 'p', text: 'El impulso interno que alimenta la pasión de cada artista, la sustancia que busca toda vía para manifestarse físicamente como arte. El querer hacer revela algo fundamental: lo emocional aún gobierna en el artista.' },
      { type: 'h3', text: 'iii. elegir hacer' },
      { type: 'p', text: 'La magia de liberar lo interno y manifestarlo de manera física. Transformar la materia con las manos es una experiencia irremplazable. El bagaje cultural de técnicas y materialidades es conocimiento compartido: un lenguaje físico, universal y matérico que se construye con tiempo y práctica.' },
      { type: 'h3', text: 'iv. poder hacer' },
      { type: 'p', text: 'La red que sostiene la producción artística en sus distintas escalas revela una realidad vital: el sistema se construye con el esfuerzo individual y colectivo de los agentes del arte, y en esa suma está su sustentabilidad. Poder hacer, habla de una practica sostenida en el tiempo.' },
      { type: 'kicker', text: 'ARTE FACTO en el Centro Cultural' },
      { type: 'h2', text: 'ESTACIÓN INDIANILLA' },
      { type: 'p', text: 'Estación Indianilla no esconde lo que fue. Sus vigas, su maquinaria y su siglo están a la vista: la sede es, ella misma, un objeto que muestra cómo está hecho: la materialización del concepto y la técnica.' },
      { type: 'image', src: '/assets/conocer-mas/photo-2.png', alt: 'Interior de Estación Indianilla' },
    ],
  },
  {
    id: 'eticas-creativas',
    words: ['ÉTICAS', 'CREATIVAS'],
    etim: [
      { word: 'ethos', def: '(gr.) carácter, modo de ser.' },
      { word: 'creare', def: '(lat.) producir, engendrar, hacer existir.' },
    ],
    blocks: [
      { type: 'h3', text: '01. rigor' },
      { type: 'p', text: 'Técnica y concepto ponderan por igual: son mutualmente inseparables. La expresión del artista es el resultado consciente de la atención a ambos elementos.' },
      { type: 'h3', text: '02. apertura' },
      { type: 'p', text: 'El trabajo habla por sí solo: de emergentes a consolidados, con o sin estudios formales o de años de prueba y error, con o sin representación por galería y/o insititución.' },
      { type: 'h3', text: '03. alineación' },
      { type: 'p', text: 'Es un ecosistema que promueve la sinergia entre el creativo, el operador, el promotor, el inversor, a través de la ganancia calibrada al máximo beneficio común..' },
      { type: 'h3', text: '04. transparencia' },
      { type: 'p', text: 'Establecer diálogos abiertos de: procesos, relaciones, convicciones, fortalezas, dificultades como valores comunes. Somos humanos en constante evolución.' },
      { type: 'h3', text: '05. transmisión' },
      { type: 'p', text: 'Lo que se sabe hacer, se enseña. La cultura se hereda compartiendo o no se hereda. Los conocimientos creativos se transfieren y garantizan su prolongación en el tiempo.' },
      { type: 'h3', text: '06. convivencia' },
      { type: 'p', text: 'Cada quien forja su parte. En una ciudad y país con una oferta cultural inmensa: nos unimos para abonar, para habilitar perspectivas, abrir diálogos sobre la creatividad y convivir.' },
      { type: 'h3', text: '07. sistema' },
      { type: 'p', text: 'Comprender que los proyectos culturales suceden en equipo. El colectivo reconoce los retos, el esfuerzo, se vincula con los agentes que activan espacios y abraza las áreas de oportunidad.' },
      { type: 'h3', text: '08. autenticidad' },
      { type: 'p', text: 'Sabemos que lo auténtico nace de lo que ya se hizo y es abonado por las perspectivas individuales y colectivas. La construcción de ideas honra sus raíces creativas.' },
    ],
  },
];

export const CIERRE = 'FORJAR CULTURA — 4 · 7 FEBRERO 2027';
