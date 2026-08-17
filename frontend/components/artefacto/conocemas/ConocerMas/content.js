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
      { type: 'h3', text: '1. saber hacer' },
      { type: 'p', text: 'Hay más artistas que nunca, y todos se preguntan lo mismo: dónde aprender. Encuentran tres caminos — la academia, que enseña técnica; las escuelas de arte, que enseñan a desarrollar concepto; y los artistas que abren su taller para enseñar haciendo. Los dos primeros tienen instituciones. El tercero es un saber creciendo sin espacio propio.' },
      { type: 'h3', text: '2. elegir hacer' },
      { type: 'p', text: 'La inteligencia artificial ya crea. Imagen, texto y música generados por computadora, cada vez mejores y en todas partes. Eso mueve el lugar del valor: cuando existe el atajo, hacer a mano se vuelve una elección. Una obra así registra sus decisiones: cada elección, cada error, cada pincelada que cubre a otra.' },
      { type: 'h3', text: '3. poder hacer' },
      { type: 'p', text: 'La inversión pública ha disminuido. El presupuesto de cultura cayó 58.3% desde su punto más alto en 2013. Lo que dependía de ese dinero hoy puede hacerse con capital privado y trabajo propio, o no puede hacerse.' },
      { type: 'kicker', text: 'ARTE FACTO en el Centro Cultural' },
      { type: 'h2', text: 'ESTACIÓN INDIANILLA' },
      { type: 'p', text: 'Estación Indianilla no esconde lo que fue. Sus vigas, su maquinaria y su siglo están a la vista: la sede es, ella misma, un objeto que muestra cómo está hecho: la materialización del concepto y la técnica.' },
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
      { type: 'h3', text: '1. rigor' },
      { type: 'p', text: 'Técnica y concepto pesan igual. Ni la idea justificando una ejecución indiferente, ni el virtuosismo sin nada que decir. Nos interesa el punto en que dejan de poder separarse: cuando la forma es la única manera posible de sostener la idea, y la idea exige exactamente esa forma y ninguna otra. No juzgamos la técnica por sí sola — juzgamos lo que aportó para construir el concepto.' },
      { type: 'h3', text: '2. apertura' },
      { type: 'p', text: 'Se entra por obra, no por quién te presenta. Sin galería que acredite y sin credencial que mostrar. Emergentes y consolidados, con o sin estudios formales, del aula o de años de prueba y error, desde México o desde fuera.' },
      { type: 'h3', text: '3. alineación' },
      { type: 'p', text: 'Ganamos cuando el artista vende. Nuestro ingreso y el del artista dependen de la misma fuente. Cuando los incentivos apuntan al mismo lado, nadie tiene que confiar en la buena voluntad del otro.' },
      { type: 'h3', text: '4. ética curatorial' },
      { type: 'p', text: 'El dinero no compra la selección. El comité decide por obra y nada más: ni patrocinador, ni marca, ni socio coloca a un artista. Lo que hace que estar aquí signifique algo es precisamente lo que no está en venta.' },
      { type: 'h3', text: '5. curaduría' },
      { type: 'p', text: 'Salón, no stands. La exposición es una sola narrativa visual, no una suma de espacios individuales. La obra se distribuye por diálogo y no por parcela: el comité busca los ejes, las tensiones y los recorridos que hacen que unas piezas signifiquen más al lado de otras.' },
      { type: 'h3', text: '6. transmisión' },
      { type: 'p', text: 'Lo que se sabe hacer, se enseña. La cultura se hereda enseñando o no se hereda. Por eso la feria muestra proceso y no solo resultado: talleres, serigrafía en vivo, bootcamp, conversatorios y pláticas con los artistas.' },
      { type: 'h3', text: '7. convivencia' },
      { type: 'p', text: 'Cada quien forja su parte. La Ciudad de México sostiene cinco ferias simultáneas, cerca de 289 galerías, academias, talleres y estudios — y en cada uno se está forjando algo. Lo inmersivo y lo conceptual no son el enemigo: son otro fuego, con su público legítimo. Existimos porque hay obra y hay público que todavía no encontraban el suyo.' },
    ],
  },
];

export const CIERRE = 'FORJAR CULTURA — 4 · 7 FEBRERO 2027';
