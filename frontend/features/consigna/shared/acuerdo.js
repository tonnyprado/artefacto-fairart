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
      "La tarifa de tu paquete cubre el espacio y los servicios de la convocatoria. Es contraprestación por tu espacio y no es reembolsable, ni en caso de retiro voluntario.",
      "Al firmar, cubres el 50% de tu paquete en las siguientes 48 horas y nos envías el comprobante.",
      "El 50% restante lo pagas a más tardar el 2 de diciembre de 2026.",
      "Te facturamos la tarifa como 'espacio de exposición'. Para eso necesitaremos tu constancia de situación fiscal, pero no te preocupes: no tiene que quedar definido ahora (lo vemos en el paso 9).",
      "Si el evento se pospone por fuerza mayor [incendios, sismos, inundaciones, etc.], tu pago se acredita íntegro a la nueva fecha o edición; nunca hay devolución en efectivo."
    ],
    "textoLegal": "La tarifa del paquete seleccionado corresponde al espacio expositivo y a los servicios descritos en la convocatoria. Constituye la contraprestación por el espacio de exposición y no es reembolsable en ningún caso, incluido el retiro voluntario del/la artista una vez efectuado el pago.\nAl firmar el presente acuerdo, el/la artista se obliga a cubrir el 50% del monto de su paquete dentro de las cuarenta y ocho horas siguientes a la firma, enviando el comprobante correspondiente para su validación. El 50% restante deberá liquidarse a más tardar el 2 de diciembre de 2026.\nARTE FACTO emitirá al/la artista una factura por la tarifa de participación, bajo el concepto de espacio de exposición. Para ello, el/la artista entregará su constancia de situación fiscal, propia o de la persona a cuyo nombre deba expedirse el comprobante, ya sea al momento de la firma o con posterioridad, antes de la emisión de dicha factura.\nSi por caso fortuito o fuerza mayor el evento no pudiera celebrarse en las fechas previstas, el monto pagado se acreditará íntegramente a la fecha reprogramada o a la edición siguiente; en ningún supuesto procederá la devolución en efectivo."
  },
  {
    "n": "3",
    "titulo": "Recepción, montaje y devolución",
    "resumen": [
      "Recepción de obra: 30 de enero al 1 de febrero de 2027 en Estación Indianilla, en el horario escalonado que te asignemos.",
      "Revisamos tu obra juntos y levantamos un reporte de condición con fotos, firmado por ambos. Lleva también tu propio registro.",
      "Entrega tus obras listas para montaje: con su sistema de montaje ya instalado, ficha técnica al reverso, certificado de autenticidad y tal como las postulaste. Embalaje y transporte (entrega y retiro) corren por tu cuenta.",
      "El montaje lo hace ARTE FACTO con una empresa especializada en montaje museográfico.",
      "Obra vendida: el comprador la recoge el lunes 8 de febrero o se le envía a domicilio. En ese caso, el comprador podrá solicitar la cotización del envío a través de la empresa de transporte de obra de arte que ARTE FACTO contrate y, de aceptarla, dicho costo correrá por su cuenta.",
      "Obra no vendida: retírala el domingo 7 al cierre o el lunes 8 de febrero. Si no puedes, avísanos antes; si vienes de otro estado, ten lista tu guía prepagada.",
      "Después del 8 de febrero las piezas no retiradas pasan a resguardo y ARTE FACTO deja de ser responsable por ellas."
    ],
    "textoLegal": "La recepción de obra se realizará del 30 de enero al 1 de febrero de 2027 en el Centro Cultural Estación Indianilla, en el horario escalonado que ARTE FACTO asigne a cada artista y comunique en las semanas previas al evento.\nNinguna obra será recibida sin la revisión de ambas partes. ARTE FACTO levantará un reporte de condición con registro fotográfico del estado de entrega, firmado por ambas partes; el/la artista deberá contar con su propio registro.\nLa obra deberá entregarse lista para montaje, con su sistema de montaje instalado, su ficha técnica al reverso, su certificado de autenticidad y tal como fue postulada. El embalaje adecuado y el transporte, tanto de entrega como de retiro, son responsabilidad del/la artista.\nEl montaje corre a cargo de ARTE FACTO, que contratará para ello a una empresa especializada en montaje museográfico.\nLa obra vendida podrá ser recogida por el comprador el lunes 8 de febrero de 2027 en la sede, o enviada a su domicilio. En ese caso, el comprador podrá solicitar la cotización del envío a través de la empresa de transporte de obra de arte que ARTE FACTO contrate y, de aceptarla, dicho costo correrá por su cuenta.\nLa obra no vendida podrá retirarse el domingo 7 de febrero al cierre del evento o el lunes 8 de febrero en la sede. Se solicita puntualidad al/la artista, ya que el desmontaje se realiza en una sola jornada.\nQuien no pueda retirar su obra en esas fechas deberá notificarlo a ARTE FACTO con anticipación y, tratándose de artistas de otros estados, contar con la guía de envío prepagada contratada oportunamente. Dichas piezas serán trasladadas a un espacio de resguardo cuya ubicación se confirmará y comunicará más adelante.\nA partir del traslado de las obras fuera de la sede, el 8 de febrero de 2027, ARTE FACTO deja de ser responsable por las piezas no retiradas."
  },
  {
    "n": "4",
    "titulo": "Responsabilidades",
    "resumen": [
      "Cuidamos la manipulación, el montaje, la seguridad y la presentación de tu obra durante todo el evento, con cuidado razonable.",
      "Estamos cotizando un seguro para la feria y la obra. Si no se concreta, te avisamos a más tardar el 15 de enero de 2027 para que asegures tu pieza por tu cuenta.",
      "Ante cualquier daño o incidente en el montaje te avisamos de inmediato para decidir juntos qué hacer.",
      "Aceptas los riesgos de exhibir (montaje, público, transporte, sismos, incendios, vandalismo…) y liberas a ARTE FACTO de esos daños.",
      "Obra delicada o de montaje complejo: debes estar presente y hacer tú las maniobras. ARTE FACTO no cubre asistentes ni materiales extra.",
      "Si tu pieza usa materiales peligrosos o es una instalación inestable, la responsabilidad frente al público es tuya."
    ],
    "textoLegal": "ARTE FACTO cuidará la manipulación de las obras, supervisará el montaje, la seguridad y la presentación de las piezas durante todo el evento.\nARTE FACTO se encuentra cotizando una póliza de seguro que ampare la feria y la obra exhibida. En caso de no concretarse, lo notificará a los artistas a más tardar el 15 de enero de 2027, con el fin de que puedan considerar asegurar sus piezas de manera individual.\nARTE FACTO actuará con cuidado razonable en la manipulación de las obras, pero no garantiza condiciones de museo ni, en tanto no se concrete la póliza referida, aseguramiento especializado.\nAnte cualquier daño o incidente durante el montaje, ARTE FACTO notificará al/la artista de inmediato para evaluar conjuntamente la situación y acordar las acciones correspondientes.\nEl/la artista acepta que la exhibición implica riesgos inherentes —manipulación durante montaje y desmontaje, interacción con el público, transporte y condiciones del espacio— y libera expresamente a ARTE FACTO de responsabilidad por daños parciales o totales a la obra, robo o extravío, accidentes ocasionados por terceros o visitantes, daños derivados de un embalaje inadecuado, sismos, incendios, inundaciones, fallas estructurales, actos vandálicos y cualquier otro evento fuera de su control.\nResponsabilidad personal. Tratándose de obra de especial cuidado o de montaje complejo, el/la artista deberá estar presente y realizar personalmente las maniobras de desembalaje, montaje, desmontaje y embalaje, asumiendo la responsabilidad por cualquier lesión que sufra durante estos procesos. ARTE FACTO no será responsable por accidentes físicos del/la artista ni de sus asistentes, ni cubrirá gastos adicionales relacionados con el montaje especializado de su obra, tales como asistentes o material.\nResponsabilidad hacia terceros. El/la artista deslinda a ARTE FACTO de cualquier responsabilidad, daño o reclamación derivada de accidentes ocasionados por el uso de materiales peligrosos en la pieza o en su estructura, por instalaciones inestables o por obras que puedan representar un riesgo para el público."
  },
  {
    "n": "5",
    "titulo": "Precio de venta, comisión y desglose",
    "resumen": [
      "ARTE FACTO te representa en todo el proceso de promoción y venta, y te avisa de cada venta de tu obra.",
      "Todas las ventas pasan por ARTE FACTO: punto de venta, cobro al público y asesores.",
      "Precio público = Ingreso del artista (75%) + Comisión ARTE FACTO (25%) = Precio base, luego + Gestión administrativa (4%) = Subtotal, luego + IVA (16%) = Precio público.",
      "El ajuste para cerrar a cifra redonda (múltiplo de 100) se distribuye proporcionalmente 75/25.",
      "Puedes autorizar un descuento máximo para facilitar ventas. Tú defines el porcentaje en la tabla de tus obras (paso 10). Cualquier descuento superior debes autorizarlo tú por escrito y se aplica proporcionalmente a ambas partes.",
      "No cierres ventas directas con contactos del evento sin avisarnos. Cualquier agente o comisión externa debe aceptarse por escrito.",
      "Comisión post-evento para ventas con clientes que provengan de la feria: mes 1, 25% · meses 2 y 3, 15% · meses 4, 5 y 6, 10%. Después de ese plazo, ya no aplica comisión.",
      "La venta de obras de arte está sujeta a obligaciones de identificación del comprador y limitación de uso de efectivo (Ley de Prevención de Lavado de Dinero). ARTE FACTO puede requerir identificación o rechazar un medio de pago cuando la ley lo exija."
    ],
    "textoLegal": "5.1 Terminología. Para evitar cualquier ambigüedad, en este acuerdo los siguientes términos tienen el significado que aquí se les asigna:\n— Ingreso del artista: el monto que el/la artista captura en la plataforma. Equivale al 75% del precio base y se expresa sin IVA.\n— Comisión ARTE FACTO: el 25% del precio base, sin IVA.\n— Precio base: la suma del Ingreso del artista (75%) más la Comisión ARTE FACTO (25%). Se expresa sin IVA.\n— Gestión administrativa: una comisión del 4% calculada sobre el precio base, destinada a cubrir los costos administrativos de la operación de venta.\n— Subtotal: el precio base más la gestión administrativa. Es la base sobre la que se calcula el IVA.\n— IVA: el 16% calculado sobre el subtotal (precio base más gestión administrativa).\n— Precio público: el subtotal más el IVA. Es la cantidad que efectivamente paga el comprador y la que se exhibe en la ficha de cada obra.\n5.2 Reparto. El Precio base de cada obra se integra por el Ingreso del artista, equivalente al 75%, y por la Comisión ARTE FACTO, equivalente al 25%. Ambos porcentajes se calculan sobre el Precio base sin IVA.\n5.3 Gestión administrativa e IVA. Sobre el Precio base se agrega la Gestión administrativa (4%), con lo que se obtiene el Subtotal; sobre el Subtotal se calcula el IVA (16%). Tanto la Gestión administrativa como el IVA corren por cuenta del comprador y no afectan la cantidad que recibe el/la artista, quien percibe su Ingreso del artista (75%) más el IVA correspondiente a esa porción.\n5.4 Ajuste a cifra cerrada. El precio público se cierra al múltiplo de cien pesos inmediato superior. Dicho ajuste forma parte del precio y se distribuye en la misma proporción (75/25), por lo que el Ingreso del artista puede incrementarse ligeramente respecto del monto que capturó.\n5.5 Representación y punto de venta. ARTE FACTO representará al/la artista durante todo el proceso de promoción y venta, operará el punto de venta y el cobro al público mediante sus asesores, y le notificará cada venta de su obra.\n5.6 Descuentos. ARTE FACTO podrá aplicar descuentos de hasta el {{descuento}} sobre el precio público, conforme a lo autorizado por el/la artista en la tabla de obras de este acuerdo. Cualquier descuento superior requerirá autorización escrita del/la artista y se aplicará proporcionalmente a ambas partes, de manera que el reparto 75/25 se mantenga sobre el precio efectivamente cobrado. A falta de porcentaje autorizado, ARTE FACTO no podrá aplicar descuento alguno sin autorización previa y por escrito del/la artista.\n5.7 Ventas posteriores al evento. El/la artista no podrá cerrar ventas directas con contactos generados durante el evento sin notificar previamente a ARTE FACTO. Las ventas concretadas con clientes cuyo origen en el evento sea justificable, ya sea que las cierre el/la artista o ARTE FACTO, causarán la siguiente comisión, contada a partir del cierre de la feria: durante el primer mes, 25%; durante el segundo y el tercer mes, 15%; y durante el cuarto, quinto y sexto mes, 10%. Concluido el sexto mes posterior al cierre de la feria, las ventas que realice el/la artista no causarán comisión alguna a favor de ARTE FACTO. En caso de que intervenga una comisión externa o un agente adicional, deberá ser notificada y aceptada por ambas partes por escrito; de no mediar dicha notificación, se entiende que ARTE FACTO es el único autorizado a participar en la venta.\n5.8 Identificación del comprador y medios de pago. El/la artista reconoce que la comercialización de obras de arte está sujeta a las obligaciones de identificación y de limitación al uso de efectivo previstas en la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita. En consecuencia, ARTE FACTO podrá requerir identificación al comprador o rechazar un medio de pago cuando dicha normativa lo exija, sin que ello genere responsabilidad alguna a su cargo frente al/la artista."
  },
  {
    "n": "6",
    "titulo": "Pagos, facturación e IVA",
    "resumen": [
      "Tu paquete lo transfieres a la cuenta de abajo: 50% en las 48 h posteriores a tu firma y el saldo restante antes del 2 de diciembre de 2026.",
      "Obra vendida durante la feria: te pagamos por transferencia dentro de los 15 días posteriores a la venta y, en todo caso, a más tardar el 10 de marzo de 2027. Obra vendida después (dentro de los 6 meses post-evento): dentro de los 15 días posteriores a cada venta.",
      "Nos emites un comprobante fiscal digital válido por tu 75% del precio base, con IVA desglosado. Puede emitirlo un tercero, siempre que ampare la operación. No te preocupes: no tiene que quedar definido ahora, pero sí será necesario para pagarte.",
      "El comprobante fiscal es requisito para pagarte. Si no lo emites, autorizas que el IVA de tu venta se retenga de tu liquidación.",
      "Datos: ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V. · RFC AFE260724NZ7 · Forma de pago transferencia electrónica de fondos · Uso del CFDI gastos en general.",
      "Según el régimen de quien facture pueden aplicar retenciones de ISR e IVA; las desglosamos en tu estado de liquidación."
    ],
    "textoLegal": "El/la artista recibirá su pago, una vez descontada la Comisión ARTE FACTO (25% del Precio base), mediante transferencia bancaria, dentro de los quince días posteriores a la venta y, en todo caso, a más tardar el 10 de marzo de 2027, tratándose de obra vendida durante el evento. Para la obra vendida con posterioridad, dentro de los seis meses siguientes al cierre de la feria, el pago se realizará dentro de los quince días posteriores a cada venta.\nEl/la artista se obliga a emitir a favor de ARTE FACTO un comprobante fiscal digital válido por el monto que le corresponde —el 75% del precio base— con el IVA desglosado. El comprobante podrá ser emitido por un tercero distinto del/la artista, siempre que ampare debidamente la operación.\nLa emisión del comprobante fiscal es requisito indispensable para efectuar el pago. ARTE FACTO no realizará liquidación alguna sin contar previamente con él.\nLos datos de facturación son los siguientes: Razón social ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V.; RFC AFE260724NZ7; forma de pago transferencia electrónica de fondos; uso del CFDI gastos en general.\nEn caso de no emitir comprobante fiscal, el/la artista autoriza y acepta que el IVA correspondiente al monto de su venta sea retenido y/o descontado de su liquidación final, quedando ARTE FACTO facultado para realizar dicho ajuste sin que ello constituya incumplimiento o motivo de reclamación.\nSegún el régimen fiscal de quien emita el comprobante, podrán resultar aplicables retenciones de ISR e IVA. De ser el caso, ARTE FACTO las descontará del pago y las enterará al SAT por cuenta del emisor, desglosándolas en el comprobante correspondiente. Cada parte es responsable de sus propias obligaciones fiscales.\nARTE FACTO entregará al/la artista un estado de liquidación con el desglose del Precio base, su Ingreso del artista (75%), la Comisión ARTE FACTO (25%), la Gestión administrativa, el Subtotal, el IVA y el monto final pagado."
  },
  {
    "n": "7",
    "titulo": "Curaduría, uso de imagen y catálogo",
    "resumen": [
      "El Comité Curatorial define la selección y ubicación de tu obra; puede reubicarla por motivos curatoriales antes del evento, pero durante la feria no se mueve. Formato de salón, respetando los metros de tu paquete.",
      "Autorizas el uso de fotos de tu obra y de tu persona —siempre con crédito— en redes, web, catálogos y material promocional.",
      "Tu obra forma parte del Catálogo Digital Oficial Edición II, la estructura del sistema de ventas multicanal.",
      "Si quieres entrar a la Boutique, te mandamos la info a más tardar el 15 de diciembre de 2026 y lo confirmas por escrito. Si lo autorizas, haremos reproducciones fineart de una obra que elijas, sin costo de producción para ti.",
      "Conservas siempre tus derechos de autor."
    ],
    "textoLegal": "La selección, disposición y ubicación de las obras corresponden al Comité Curatorial y son definitivas. Por motivos curatoriales, las piezas del/la artista podrán reubicarse de manera anticipada, antes de la apertura del evento; una vez iniciado, las obras no se moverán. La exhibición se presenta en formato de salón, por lo que no se asigna un muro individual por artista, respetando siempre los metros contratados en el paquete.\nEl/la artista autoriza a ARTE FACTO a utilizar fotografías de su obra y de su persona, otorgando siempre el crédito correspondiente, en redes sociales y sitio web, catálogos físicos o digitales, medios impresos y material promocional del proyecto, así como para su archivo.\nToda obra seleccionada formará parte del Catálogo Digital Oficial ARTE FACTO | Edición II, con crédito y ficha técnica completa. El catálogo en línea es la estructura que sostiene el sistema de ventas multicanal.\nSi el/la artista lo autoriza, se generarán reproducciones fine art de una de sus obras, elegida por él o ella, en artículos de la Boutique, sin costo de producción a su cargo. ARTE FACTO enviará al correo del/la artista la información del esquema de participación sobre dichas ventas a más tardar el 15 de diciembre de 2026, y su aplicación requerirá la aceptación por escrito del/la artista. En tanto no exista dicha aceptación, no se producirán reproducciones de su obra.\nEl/la artista conserva en todo momento los derechos de autor sobre su obra."
  },
  {
    "n": "8",
    "titulo": "Notificaciones",
    "resumen": [
      "Toda comunicación oficial (horarios, montaje, seguro, liquidaciones) te llega por correo electrónico.",
      "Las notificaciones de ARTE FACTO se tienen por recibidas al día hábil siguiente de su envío.",
      "Avísanos si cambian tus datos de contacto (dentro de los 5 días naturales siguientes).",
      "Domicilio de ARTE FACTO: Providencia 325, Col. Del Valle Norte, C.P. 03103, Alcaldía Benito Juárez, Ciudad de México. Correo: curatorial@arte-facto.mx"
    ],
    "textoLegal": "Toda comunicación entre las partes se realizará por escrito, incluido el correo electrónico, a las direcciones señaladas en este acuerdo. Las notificaciones de ARTE FACTO relativas a logística —horarios de recepción, montaje, devolución, seguro y liquidación de ventas— se enviarán al correo del/la artista y se tendrán por recibidas al día hábil siguiente de su envío.\nEl/la artista se obliga a informar cualquier cambio en sus datos de contacto dentro de los cinco días naturales siguientes. ARTE FACTO señala como domicilio para efectos de este acuerdo el ubicado en Providencia 325, Colonia Del Valle Norte, C.P. 03103, Alcaldía Benito Juárez, Ciudad de México, y como correo electrónico curatorial@arte-facto.mx."
  },
  {
    "n": "9",
    "titulo": "Disposiciones finales",
    "resumen": [
      "Este acuerdo, junto con la convocatoria, los Términos y Condiciones y el Aviso de Privacidad, es el acuerdo completo entre nosotros.",
      "En caso de discrepancia, prevalece lo dispuesto en este acuerdo.",
      "Cualquier cambio tiene que ser por escrito y firmado por ambos.",
      "La nulidad de alguna cláusula no afecta la validez de las restantes.",
      "No puedes ceder los derechos y obligaciones de este acuerdo sin nuestro consentimiento previo y por escrito."
    ],
    "textoLegal": "Este acuerdo, junto con la convocatoria oficial, los Términos y Condiciones y el Aviso de Privacidad publicados en arte-facto.mx, constituye el acuerdo íntegro entre las partes respecto de la participación, exhibición, consignación y venta de la obra. En caso de discrepancia sobre cualquiera de esas materias, prevalecerá lo dispuesto en el presente acuerdo.\nCualquier modificación a este acuerdo deberá constar por escrito y firmarse por ambas partes. La nulidad de alguna de sus cláusulas no afectará la validez de las restantes. El/la artista no podrá ceder los derechos y obligaciones derivados de este acuerdo sin el consentimiento previo y por escrito de ARTE FACTO."
  },
  {
    "n": "10",
    "titulo": "Resolución de conflictos",
    "resumen": [
      "Si hay algún desacuerdo, primero lo hablamos en diálogo directo.",
      "Si no se resuelve, vamos a mediación con un mediador designado de común acuerdo o un centro certificado de la CDMX.",
      "Los tribunales de la Ciudad de México son solo el último recurso si la mediación se agota sin resultado."
    ],
    "textoLegal": "Cualquier conflicto derivado de este acuerdo será resuelto preferentemente mediante diálogo directo. De no alcanzarse una solución, las partes acuerdan someterse a un proceso de mediación ante un mediador designado de común acuerdo o ante un centro de mediación certificado de la Ciudad de México.\nÚnicamente cuando la mediación se hubiere agotado sin resultado, y como último recurso ante controversias que las partes no hayan logrado resolver por las vías anteriores, podrán acudir a los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros."
  },
  {
    "n": "11",
    "titulo": "Aceptación de riesgo",
    "resumen": [
      "Declaras que eres autor y legítimo propietario de las obras.",
      "Entiendes los riesgos de exhibir tu obra y aceptas las condiciones.",
      "Participas de manera voluntaria.",
      "Leíste los Términos y Condiciones y el Aviso de Privacidad.",
      "Liberas a ARTE FACTO de cualquier responsabilidad no derivada de dolo comprobable."
    ],
    "textoLegal": "El/la artista declara que:\n— Es autor y legítimo propietario de las obras entregadas en consignación.\n— Entiende completamente los riesgos de exhibir su obra y acepta las condiciones del espacio.\n— Participa de manera voluntaria.\n— Ha leído los Términos y Condiciones y el Aviso de Privacidad publicados en arte-facto.mx.\n— Libera a ARTE FACTO de cualquier responsabilidad no derivada de dolo comprobable.\nEl/la artista entrega la obra en consignación bajo las condiciones descritas y autoriza a ARTE FACTO para representar su obra durante el evento. Ambas partes declaran que han leído y entendido los términos de este acuerdo, y lo firman de común acuerdo."
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

export const PREAMBULO = "Por medio del presente acuerdo, el/la artista cede en consignación a ARTE FACTO ÉTICAS CREATIVAS, S. de R.L. de C.V. las obras que más adelante se describen, para su exhibición y venta durante la Segunda Edición de ARTE FACTO | Éticas Creativas, que se celebrará del 4 al 7 de febrero de 2027 en el Centro Cultural Estación Indianilla, ubicado en Dr. Claudio Bernard 111, Col. Doctores, Alcaldía Cuauhtémoc, Ciudad de México.\nEl objetivo es difundir el trabajo del/la artista, generar oportunidades de venta y acercar su obra a nuevos públicos, dentro de un proyecto curatorial que reúne a artistas nacionales e internacionales durante la Semana del Arte.\nLa consignación no transfiere la propiedad de las obras: cada pieza permanece en propiedad del/la artista hasta el momento de su venta. Al concretarse la venta, la propiedad se transmite del/la artista a ARTE FACTO y de ésta al comprador en el mismo acto, lo que sustenta la emisión de los comprobantes fiscales en esa cadena. ARTE FACTO actúa como intermediario para la promoción y venta.";

export const CLAUSULA_1_DOCUMENTO = {
  intro: 'El/la artista deja en consignación las obras que se listan a continuación, conforme al resumen de postulación generado por la plataforma. Los importes se expresan en pesos mexicanos (MXN) e incluyen el ajuste a cifra cerrada descrito en la cláusula 5.\nLos precios asentados en esta tabla son los definitivos para todos los efectos de este acuerdo y sustituyen cualquier precio sugerido o preliminar mostrado durante la postulación.',
  descuento: 'Descuento máximo autorizado por el/la artista:',
  estado: 'Estado de las obras: se asentará en el reporte de condición con registro fotográfico al momento de la recepción. Ninguna obra será recibida sin la firma del presente acuerdo. Las obras no podrán retirarse durante el evento sin autorización previa de ARTE FACTO.',
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
