// ⚠ Archivo generado desde el prototipo aprobado. Mantener IDÉNTICO en backend y frontend.
// Texto legal = Acuerdo de Consignación de Obra · ARTE FACTO · Segunda Edición.
// {{descuento}} se sustituye por el % que el artista autoriza en el paso 10.

export const VERSION_ACUERDO = 'AF2-consigna-v4';

/**
 * @typedef {Object} Clausula
 * @property {string} n
 * @property {string} titulo
 * @property {string[]} resumen - viñetas en lenguaje simple (pantallas 1–8)
 * @property {string} textoLegal - texto literal del acuerdo (usa \n entre párrafos)
 */

/** @type {Clausula[]} */
export const CLAUSULAS = [
  {
    "n": "1",
    "titulo": "Obra en consignación",
    "resumen": [
      "Dejas tus obras en consignación para exhibirlas y venderlas en ARTE FACTO | Éticas Creativas, Segunda Edición: 4 al 7 de febrero de 2027, Centro Cultural Estación Indianilla (Dr. Claudio Bernard 111, Col. Doctores).",
      "La consignación no transfiere la propiedad: cada pieza sigue siendo tuya hasta que se venda. ARTE FACTO solo actúa como intermediario.",
      "Las obras son las de tu resumen de postulación — las revisarás con sus precios en el paso 10.",
      "Ninguna obra se recibe sin este acuerdo firmado, y no pueden retirarse durante el evento sin autorización."
    ],
    "textoLegal": "El/la artista deja en consignación las obras descritas en la tabla de obras, conforme al resumen de postulación generado por la plataforma.\nNinguna obra será recibida sin la firma del presente acuerdo.\nLas obras no podrán retirarse durante el evento sin autorización previa de ARTE FACTO."
  },
  {
    "n": "2",
    "titulo": "Tarifa de participación",
    "resumen": [
      "La tarifa de tu paquete cubre el espacio y los servicios de la convocatoria. Es capital de trabajo del evento y no es reembolsable, ni en caso de retiro voluntario.",
      "Al firmar, cubres el 50% de tu paquete en las siguientes 48 horas y nos envías el comprobante.",
      "El saldo restante lo pagas en las parcialidades que prefieras, a más tardar el 24 de octubre de 2026.",
      "Te facturamos la tarifa como 'espacio de exposición'. Para eso necesitaremos tu constancia de situación fiscal, pero no te preocupes: no tiene que quedar definido ahora (lo vemos en el paso 9).",
      "Si el evento se pospone por fuerza mayor [incendios, sismos, inundaciones, etc.], tu pago se acredita íntegro a la nueva fecha o edición; nunca hay devolución en efectivo."
    ],
    "textoLegal": "La tarifa del paquete seleccionado corresponde al espacio expositivo y a los servicios descritos en la convocatoria. Constituye capital de trabajo destinado a la producción del evento y, en consecuencia, no es reembolsable en ningún caso, incluido el retiro voluntario del/la artista una vez efectuado el pago.\nAl firmar el presente acuerdo, el/la artista se obliga a cubrir el 50% del monto de su paquete dentro de las cuarenta y ocho horas siguientes, enviando el comprobante correspondiente para su validación. El saldo restante podrá liquidarse en los pagos parciales que prefiera, con fecha límite del 24 de octubre de 2026.\nARTE FACTO emitirá al/la artista una factura por la tarifa de participación, bajo el concepto de espacio de exposición. Para ello, el/la artista entregará su constancia de situación fiscal, propia o de la persona a cuyo nombre deba expedirse el comprobante, ya sea al momento de la firma o con posterioridad, antes de la emisión de dicha factura.\nSi por caso fortuito o fuerza mayor [incendios, sismos, inundaciones, etc.] el evento no pudiera celebrarse en las fechas previstas, el monto pagado se acreditará íntegramente a la fecha reprogramada o a la edición siguiente; en ningún supuesto procederá la devolución en efectivo."
  },
  {
    "n": "3",
    "titulo": "Recepción, montaje y devolución",
    "resumen": [
      "Recepción de obra: 30 de enero al 1 de febrero de 2027 en Estación Indianilla, en el horario escalonado que te asignemos.",
      "Revisamos tu obra juntos y levantamos un reporte de condición con fotos, firmado por ambos. Lleva también tu propio registro.",
      "Entrega tus obras listas para montaje: con su sistema de montaje ya instalado, ficha técnica al reverso, certificado de autenticidad y tal como las postulaste. Embalaje y transporte (entrega y retiro) corren por tu cuenta.",
      "El montaje lo hace ARTE FACTO con una empresa especializada en montaje museográfico.",
      "Obra vendida: el comprador la recoge el lunes 8 de febrero o se le envía a domicilio, a su costo.",
      "Obra no vendida: retírala el domingo 7 al cierre o el lunes 8 de febrero. Si no puedes, avísanos antes; si vienes de otro estado, ten lista tu guía prepagada.",
      "Después del 8 de febrero las piezas no retiradas pasan a resguardo y ARTE FACTO deja de ser responsable por ellas."
    ],
    "textoLegal": "La recepción de obra se realizará del 30 de enero al 1 de febrero de 2027 en el Centro Cultural Estación Indianilla, en el horario escalonado que ARTE FACTO asigne a cada artista y comunique en las semanas previas al evento.\nNinguna obra será recibida sin la revisión de ambas partes. ARTE FACTO levantará un reporte de condición con registro fotográfico del estado de entrega, firmado por ambas partes; el/la artista deberá contar con su propio registro.\nLa obra deberá entregarse lista para montaje, con su sistema de montaje instalado, su ficha técnica al reverso, su certificado de autenticidad y tal como fue postulada. El embalaje adecuado y el transporte, tanto de entrega como de retiro, son responsabilidad del/la artista.\nEl montaje corre a cargo de ARTE FACTO, que contratará para ello a una empresa especializada en montaje museográfico.\nLa obra vendida podrá ser recogida por el comprador el lunes 8 de febrero de 2027 en la sede, o enviada a su domicilio a través de la empresa de transporte de obra de arte que ARTE FACTO contrate, cuyo costo corre por cuenta del comprador.\nLa obra no vendida podrá retirarse el domingo 7 de febrero al cierre del evento o el lunes 8 de febrero en la sede. Se solicita puntualidad al/la artista, ya que el desmontaje se realiza en una sola jornada.\nQuien no pueda retirar su obra en esas fechas deberá notificarlo a ARTE FACTO con anticipación y, tratándose de artistas de otros estados, contar con la guía de envío prepagada contratada oportunamente. Dichas piezas serán trasladadas a un espacio de resguardo cuya ubicación se confirmará y comunicará más adelante.\nA partir del traslado de las obras fuera de la sede, el 8 de febrero de 2027, ARTE FACTO deja de ser responsable por las piezas no retiradas."
  },
  {
    "n": "4",
    "titulo": "Responsabilidades",
    "resumen": [
      "Cuidamos la manipulación, el montaje, la seguridad y la presentación de tu obra durante todo el evento, con cuidado razonable.",
      "Estamos cotizando un seguro para la feria y la obra. Si no se concreta, te avisamos con tiempo para que asegures tu pieza por tu cuenta.",
      "Ante cualquier daño o incidente en el montaje te avisamos de inmediato para decidir juntos qué hacer.",
      "Aceptas los riesgos de exhibir (montaje, público, transporte, sismos, incendios, vandalismo…) y liberas a ARTE FACTO de esos daños.",
      "Obra delicada o de montaje complejo: debes estar presente y hacer tú las maniobras. ARTE FACTO no cubre asistentes ni materiales extra.",
      "Si tu pieza usa materiales peligrosos o es una instalación inestable, la responsabilidad frente al público es tuya."
    ],
    "textoLegal": "ARTE FACTO cuidará la manipulación de las obras, supervisará el montaje, la seguridad y la presentación de las piezas durante todo el evento.\nARTE FACTO se encuentra cotizando una póliza de seguro que ampare la feria y la obra exhibida. En caso de no concretarse, lo notificará a los artistas con suficiente anticipación para que puedan considerar asegurar sus piezas de manera individual.\nARTE FACTO actuará con cuidado razonable en la manipulación de las obras, pero no garantiza condiciones de museo ni, en tanto no se concrete la póliza referida en el párrafo anterior, aseguramiento especializado.\nAnte cualquier daño o incidente durante el montaje, ARTE FACTO notificará al/la artista de inmediato para evaluar conjuntamente la situación y acordar las acciones correspondientes.\nEl/la artista acepta que la exhibición implica riesgos inherentes —manipulación durante montaje y desmontaje, interacción con el público, transporte y condiciones del espacio— y libera expresamente a ARTE FACTO de responsabilidad por daños parciales o totales a la obra, robo o extravío, accidentes ocasionados por terceros o visitantes, daños derivados de un embalaje inadecuado, sismos, incendios, inundaciones, fallas estructurales, actos vandálicos y cualquier otro evento fuera de su control.\nResponsabilidad personal. Tratándose de obra de especial cuidado o de montaje complejo, el/la artista deberá estar presente y realizar personalmente las maniobras de desembalaje, montaje, desmontaje y embalaje, asumiendo la responsabilidad por cualquier lesión que sufra durante estos procesos. ARTE FACTO no será responsable por accidentes físicos del/la artista ni de sus asistentes. ARTE FACTO no cubrirá gastos adicionales relacionados al montaje especializado de la obra del/la artista: asistentes, material, etc.\nResponsabilidad hacia terceros. El/la artista deslinda a ARTE FACTO de cualquier responsabilidad, daño, pormenor o reclamación derivada de accidentes presentados por el uso de materiales peligrosos en la pieza o en su estructura, por instalaciones inestables o por obras que puedan representar un riesgo para el público."
  },
  {
    "n": "5",
    "titulo": "Condiciones de venta y comisión",
    "resumen": [
      "ARTE FACTO te representa en todo el proceso de promoción y venta, y te avisa de cada venta de tu obra.",
      "Todas las ventas pasan por ARTE FACTO: punto de venta, cobro al público y asesores.",
      "Precio de venta = tu parte (75%) + comisión ARTE FACTO (25%). El ajuste para cerrar la cifra también se reparte 75/25. Al público se suma IVA (16%) y 3% por gastos de gestión administrativa — lo cubre el comprador. Tú recibes tu 75% más su IVA.",
      "Puedes darnos una opción de descuento para facilitar ventas —sugerimos 10%—. Tú defines el porcentaje en la tabla de tus obras (paso 10). Cualquier descuento superior debes autorizarlo tú por escrito y se aplica proporcionalmente a ambas partes.",
      "No cierres ventas directas con contactos del evento sin avisarnos. Cualquier agente o comisión externa debe aceptarse por escrito.",
      "Comisión post-evento para ventas con clientes que provengan de la feria: mes 1, 25% · meses 2 y 3, 15% · meses 4, 5 y 6, 10%. Después de ese plazo, ya no aplica comisión."
    ],
    "textoLegal": "ARTE FACTO representará al/la artista durante todo el proceso de promoción y venta, y le notificará cada venta de su obra.\nTodas las ventas se gestionan a través de ARTE FACTO, que opera el punto de venta, el cobro al público y la labor comercial mediante sus asesores.\nEl precio de venta es determinado por el/la artista y se integra por la parte que le corresponde, equivalente al 75%, y la comisión de ARTE FACTO, equivalente al 25%. El ajuste que se aplique para cerrar el precio de venta a una cifra redonda forma parte de este y se distribuye en la misma proporción.\nSobre el precio de venta se agrega el Impuesto al Valor Agregado (16%) y un 3% por concepto de gastos de gestión administrativa de la operación de venta. Ambos importes corren por cuenta del comprador y no afectan la cantidad que recibe el/la artista, quien percibirá su 75% más el IVA correspondiente a esa porción.\nEl/la artista podrá ofrecer una opción de descuento sobre el precio de venta, cuyo porcentaje máximo define en la tabla de obras del presente acuerdo; se sugiere un 10%. Para este acuerdo, el/la artista autoriza un descuento máximo de {{descuento}}. Cualquier descuento superior requerirá autorización escrita del/la artista y se aplicará proporcionalmente a ambas partes.\nEl/la artista no podrá cerrar ventas directas con contactos generados durante el evento sin notificar previamente a ARTE FACTO.\nEn caso de que intervenga una comisión externa o agente adicional, deberá ser notificada y aceptada por ambas partes por escrito. De no mediar dicha notificación, se asume que ARTE FACTO es el único autorizado a participar en la venta.\nSi el/la artista es contactado por un cliente que haya conocido su trabajo durante el evento, se compromete a notificar a ARTE FACTO en caso de concretarse una venta posterior con dicho cliente dentro de los seis meses siguientes al cierre de la feria. Las ventas concretadas con clientes cuyo origen en el evento sea justificable, ya sea que las cierre el/la artista o ARTE FACTO, causarán la siguiente comisión, contada a partir del cierre de la feria: durante el primer mes, 25%; durante el segundo y el tercer mes, 15%; y durante el cuarto, quinto y sexto mes, 10%. Concluido el sexto mes posterior al cierre de la feria, las ventas que realice el/la artista no causarán comisión alguna a favor de ARTE FACTO."
  },
  {
    "n": "6",
    "titulo": "Pagos, facturación e IVA",
    "resumen": [
      "Tu paquete lo transfieres a la cuenta de abajo: 50% en las 48 h posteriores a tu firma y el saldo restante antes del 24 de octubre de 2026.",
      "Obra vendida durante la feria: te pagamos por transferencia dentro de los 15 días posteriores a la venta o a más tardar el 10 de marzo de 2027. Obra vendida después (dentro de los 6 meses post-evento): dentro de los 15 días posteriores a cada venta.",
      "Nos emites una factura por tu 75% del precio de venta, con IVA desglosado. Puede emitirla un tercero, siempre que ampare la operación. No te preocupes: no tiene que quedar definido ahora, pero sí será necesaria para pagarte.",
      "La factura es requisito para pagarte. Si no facturas, autorizas que el IVA de tu venta se retenga de tu liquidación.",
      "Datos: ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V. · RFC AFE260724NZ7 · Transferencia · Gastos en general.",
      "Según el régimen de quien facture pueden aplicar retenciones de ISR e IVA; las desglosamos en tu comprobante de venta."
    ],
    "textoLegal": "El/la artista recibirá su pago una vez descontada la comisión correspondiente sobre el precio de venta, mediante transferencia bancaria, dentro de los quince días posteriores a la venta o a más tardar el 10 de marzo de 2027, tratándose de obra vendida durante el evento. Para la obra vendida con posterioridad, dentro de los seis meses siguientes al cierre de la feria, el pago se realizará dentro de los quince días posteriores a cada venta.\nEl/la artista se obliga a emitir a favor de ARTE FACTO una factura fiscal válida por el monto que le corresponde —el 75% del precio de venta— con el IVA desglosado. La factura podrá ser emitida por un tercero distinto del/la artista, siempre que ampare debidamente la operación.\nLa emisión de la factura será requisito indispensable para efectuar el pago correspondiente, y deberá emitirse dentro de los plazos establecidos por ARTE FACTO tras confirmarse la venta de la obra.\nLos datos de facturación son los siguientes: Razón social: ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V.; RFC: AFE260724NZ7; Medio de pago: transferencia; Concepto: gastos en general.\nEn caso de no emitir factura, el/la artista autoriza y acepta que el IVA correspondiente al monto de su venta sea retenido y/o descontado de su liquidación final, quedando ARTE FACTO facultado para realizar dicho ajuste sin que ello constituya incumplimiento o motivo de reclamación.\nSegún el régimen fiscal de quien emita la factura, podrán resultar aplicables retenciones de ISR e IVA. De ser el caso, ARTE FACTO las descontará del pago y las enterará al SAT por cuenta del emisor, desglosándolas en el comprobante correspondiente. Cada parte es responsable de sus propias obligaciones fiscales.\nARTE FACTO proporcionará comprobante de venta con el desglose del precio, la comisión, el IVA y el monto final pagado al/la artista."
  },
  {
    "n": "7",
    "titulo": "Curaduría, uso de imagen y catálogo",
    "resumen": [
      "El Comité Curatorial define la selección y ubicación de tu obra; puede reubicarla por motivos curatoriales antes del evento, pero durante la feria no se mueve. Formato de salón, respetando los metros de tu paquete.",
      "Autorizas el uso de fotos de tu obra y de tu persona —siempre con crédito— en redes, web, catálogos y material promocional.",
      "Tu obra forma parte del Catálogo Digital Oficial Edición II, la estructura del sistema de ventas multicanal.",
      "Si lo autorizas, haremos reproducciones fineart de una obra que elijas para la Boutique, sin costo de producción para ti. Recibirás ganancias por cada venta de esas piezas; el porcentaje aún está por definirse y te lo comunicaremos por escrito antes del evento.",
      "Conservas siempre tus derechos de autor."
    ],
    "textoLegal": "La selección, disposición y ubicación de las obras corresponden al Comité Curatorial y son definitivas. Por motivos curatoriales, las piezas del/la artista podrán reubicarse de manera anticipada, antes de la apertura del evento; una vez iniciado, las obras no se moverán. La exhibición se presenta en formato de salón, por lo que no se asigna un muro individual por artista, respetando siempre los metros contratados en el paquete.\nEl/la artista autoriza a ARTE FACTO a utilizar fotografías de su obra y de su persona, otorgando siempre el crédito correspondiente, en redes sociales y sitio web, catálogos físicos o digitales, medios impresos y material promocional del proyecto, así como para su archivo.\nToda obra seleccionada formará parte del Catálogo Digital Oficial ARTE FACTO | Edición II, con crédito y ficha técnica completa. El catálogo en línea es la estructura que sostendrá el sistema de ventas multicanal.\nSi el/la artista autoriza, se generarán reproducciones fineart de una de sus obras, elegida por él o ella, en artículos de la Boutique, sin costo de producción a su cargo. El esquema de participación y ganancias sobre esas ventas se comunicará por escrito antes del evento.\nEl/la artista conserva en todo momento los derechos de autor sobre su obra."
  },
  {
    "n": "8",
    "titulo": "Resolución de conflictos",
    "resumen": [
      "Cualquier malentendido lo resolvemos primero con diálogo directo.",
      "Si no llegamos a un acuerdo, acudimos a mediación —con un mediador elegido por ambos o un centro certificado de la CDMX— antes de cualquier acción legal."
    ],
    "textoLegal": "Cualquier conflicto o malentendido derivado de este acuerdo será resuelto preferentemente mediante diálogo directo. En caso de no llegar a una solución, ambas partes acuerdan recurrir a un proceso de mediación ante un mediador designado de común acuerdo o ante un centro de mediación certificado de la Ciudad de México, antes de emprender acciones legales."
  }
];

/** @type {string[]} */
export const DECLARACIONES_PANTALLA = [
  "Eres autor y legítimo propietario de las obras entregadas en consignación.",
  "Entiendes los riesgos de exhibir tu obra y aceptas las condiciones del espacio.",
  "Participas de manera voluntaria.",
  "Leíste los Términos y Condiciones y el Aviso de Privacidad de arte-facto.mx.",
  "Liberas a ARTE FACTO de cualquier responsabilidad no derivada de dolo comprobable."
];

/** @type {string[]} */
export const DECLARACIONES_DOCUMENTO = [
  "Es autor y legítimo propietario de las obras entregadas en consignación.",
  "Entiende completamente los riesgos de exhibir su obra y acepta las condiciones del espacio.",
  "Participa de manera voluntaria.",
  "Ha leído los Términos y Condiciones y el Aviso de Privacidad publicados en arte-facto.mx.",
  "Libera a ARTE FACTO de cualquier responsabilidad no derivada de dolo comprobable."
];

export const PREAMBULO = "Por medio del presente acuerdo, el/la artista cede en consignación a ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V. las obras que más adelante se describen, para su exhibición y venta durante la Segunda Edición de ARTE FACTO | Éticas Creativas, que se celebrará del 4 al 7 de febrero de 2027 en el Centro Cultural Estación Indianilla, ubicado en Dr. Claudio Bernard 111, Col. Doctores, Alcaldía Cuauhtémoc, Ciudad de México.\nEl objetivo es difundir el trabajo del/la artista, generar oportunidades de venta y acercar su obra a nuevos públicos, dentro de un proyecto curatorial que reúne a artistas nacionales e internacionales durante la Semana del Arte.\nLa consignación no transfiere la propiedad de las obras: cada pieza permanece en propiedad del/la artista hasta el momento de su venta, y ARTE FACTO actúa exclusivamente como intermediario para su promoción y venta.";

export const CLAUSULA_1_DOCUMENTO = {
  intro: 'El/la artista deja en consignación las siguientes obras, conforme al resumen de postulación generado por la plataforma:',
  estado: 'Estado de las obras: se asentará en el reporte de condición con registro fotográfico al momento de la recepción.',
  cierre: 'Ninguna obra será recibida sin la firma del presente acuerdo.\nLas obras no podrán retirarse durante el evento sin autorización previa de ARTE FACTO.',
};

export const CIERRE_DOCUMENTO = 'El/la artista entrega la obra en consignación bajo las condiciones descritas y autoriza a ARTE FACTO para representar su obra durante el evento. Ambas partes declaran que han leído y entendido los términos de este acuerdo, y lo firman de común acuerdo.';

/**
 * @param {number | null} descuento
 * @returns {string}
 */
export function formatearDescuento(descuento) {
  if (descuento === null) return '____%';
  return descuento === 0 ? '0% (sin descuento)' : descuento + '%';
}

/**
 * @param {number | null} descuento
 * @returns {Clausula[]}
 */
export function clausulasConDescuento(descuento) {
  const d = formatearDescuento(descuento);
  return CLAUSULAS.map(c => ({
    ...c,
    resumen: c.resumen.map(r => r.split('{{descuento}}').join(d)),
    textoLegal: c.textoLegal.split('{{descuento}}').join(d),
  }));
}
