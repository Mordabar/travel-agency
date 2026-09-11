/**
 * FUENTE ÚNICA DE VERDAD COMERCIAL — Travel_Jet
 * ------------------------------------------------------------------
 * Regla estricta del proyecto: NADA en la experiencia 3D inventa
 * información comercial. Todo dato de negocio (plan, precio, destino,
 * promoción, testimonio, licencia, contacto) se lee desde este archivo.
 *
 * Los campos con valor `null` o arrays vacíos son información que
 * Travel_Jet aún no ha suministrado. La interfaz está diseñada para
 * degradar con elegancia cuando faltan: NO se rellenan con inventos.
 * Al recibir el material real, basta con completar este archivo.
 * ------------------------------------------------------------------
 */

export const brand = {
  name: 'Travel_Jet',
  legalName: 'Travel Jet S.A.S.',
  city: 'Bucaramanga',
  region: 'Santander',
  country: 'Colombia',
  site: 'traveljetcol.com',
  // Descripción real publicada por la agencia.
  tagline: 'Planes turísticos nacionales, internacionales y cruceros.',
  intro:
    'Agencia de viajes en Bucaramanga, Santander, especializada en planes ' +
    'turísticos nacionales e internacionales, incluyendo cruceros, diseñados ' +
    'para todos los gustos y presupuestos.'
};

export const contact = {
  // Número comercial publicado de Travel Jet S.A.S. (Bucaramanga).
  phoneDisplay: '+57 321 755 1963',
  phoneE164: '573217551963',
  whatsappE164: '573217551963',
  addressLine: 'Calle 34 # 10-49, Piso 2, Edificio Rovir',
  addressCity: 'Bucaramanga, Santander, Colombia',
  // Pendiente de suministro por Travel_Jet. No se inventa.
  email: null,
  hours: null,
  social: [
    { label: 'Facebook', url: 'https://www.facebook.com/traveljetsas/' }
  ]
};

/**
 * Tipos de viaje reales que ofrece la agencia.
 * `blurb` proviene de la descripción publicada por Travel_Jet.
 */
export const categories = [
  {
    id: 'nacionales',
    title: 'Viajes nacionales',
    blurb: 'Explora destinos dentro de Colombia.',
    waMessage: 'Hola Travel_Jet, quiero información sobre viajes nacionales.',
    palette: { key: 0x4fd6c4, fog: 0x061a22, accent: 0x8ff0e0 }
  },
  {
    id: 'internacionales',
    title: 'Viajes internacionales',
    blurb: 'Descubre culturas y paisajes fuera de Colombia.',
    waMessage: 'Hola Travel_Jet, quiero información sobre viajes internacionales.',
    palette: { key: 0xe8c37a, fog: 0x0a1430, accent: 0xffe0a8 }
  },
  {
    id: 'cruceros',
    title: 'Cruceros',
    blurb: 'Rutas por el Caribe.',
    waMessage: 'Hola Travel_Jet, quiero información sobre cruceros.',
    palette: { key: 0x7fb8ff, fog: 0x03121f, accent: 0xcfe9ff }
  }
];

/**
 * PLANES REALES.
 * Vacío hasta que Travel_Jet suministre el catálogo. La Travel Gallery
 * muestra los portales de categoría reales mientras tanto.
 *
 * Forma esperada de cada plan (sólo se muestran los campos presentes):
 * {
 *   id: 'slug-unico',
 *   name: 'Nombre exacto del plan',
 *   destination: 'Destino',
 *   category: 'nacionales' | 'internacionales' | 'cruceros',
 *   description: 'Descripción tal cual la entrega Travel_Jet',
 *   includes: ['Ítem incluido', '...'],
 *   price: 'Texto exacto del precio, p. ej. "COP 1.890.000 por persona"',
 *   promo: 'Texto exacto de la promoción, si existe',
 *   image: '/planes/archivo.jpg'
 * }
 */
export const plans = [];

/**
 * FOTOGRAFÍAS REALES de Travel_Jet para la sala de recuerdos.
 * Coloca los archivos en `public/recuerdos/` y lista sus rutas aquí
 * (p. ej. '/recuerdos/cartagena.jpg'). Mientras esté vacío, la sala usa
 * paisajes ilustrados generados por código, nunca banco de imágenes.
 */
export const memoryPhotos = [];

/**
 * OPINIONES REALES.
 * Vacío hasta recibir los testimonios verificados de Travel_Jet.
 * Forma: { id, name, text, trip }  — sin fotos ni valoraciones inventadas.
 */
export const testimonials = [];

/**
 * INFORMACIÓN ÚTIL (Travel Information Desk).
 * Sólo preguntas cuya respuesta se apoya en información publicada por la
 * agencia. Todo lo demás se deriva explícitamente a la asesora por WhatsApp.
 */
export const infoDesk = [
  {
    q: '¿Qué tipo de viajes maneja Travel_Jet?',
    a: 'Planes turísticos nacionales e internacionales, incluyendo cruceros.'
  },
  {
    q: '¿Dónde está Travel_Jet?',
    a: 'En Bucaramanga, Santander, Colombia.'
  },
  {
    q: '¿Para qué presupuestos hay planes?',
    a: 'Los planes están diseñados para todos los gustos y presupuestos.'
  },
  {
    q: '¿Cómo se cotiza un viaje?',
    a: 'La asesoría es personalizada y continúa por WhatsApp.',
    wa: 'Hola Travel_Jet, quiero asesoría para mi próximo viaje.'
  }
];

/**
 * LICENCIA / REGISTRO.
 * No se inventa ningún número ni certificación. `rnt` y `documents`
 * se completan con los documentos reales que entregue Travel_Jet.
 */
export const license = {
  legalName: 'Travel Jet S.A.S.',
  city: 'Bucaramanga, Santander, Colombia',
  rnt: null,          // p. ej. 'RNT 123456'
  nit: null,
  documents: [],      // p. ej. [{ label: 'Certificado RNT', url: '/licencia/rnt.pdf' }]
  note:
    'Travel_Jet opera como agencia de viajes constituida en Bucaramanga. ' +
    'Los documentos y registros oficiales se publican en esta sección.'
};

/** Mensajes de WhatsApp por contexto. Evitan repetir el mismo texto. */
export const waMessages = {
  hero: 'Hola Travel_Jet, quiero que me ayuden a planear un viaje.',
  plans: 'Hola Travel_Jet, quiero conocer los planes disponibles.',
  planNamed: (planName) => `Hola Travel_Jet, estoy interesado en el plan ${planName}.`,
  horizon: 'Hola Travel_Jet, quiero viajar. ¿Me ayudan a elegir destino?',
  memories: 'Hola Travel_Jet, quiero vivir mi propio viaje.',
  opinions: 'Hola Travel_Jet, quiero hablar con un asesor.',
  license: 'Hola Travel_Jet, tengo una consulta sobre la agencia.',
  contact: 'Hola Travel_Jet, quiero asesoría para mi próximo viaje.',
  floating: 'Hola Travel_Jet, vengo de la web y quiero información.'
};

export function waLink(message) {
  return `https://wa.me/${contact.whatsappE164}?text=${encodeURIComponent(message)}`;
}

export function telLink() {
  return `tel:+${contact.phoneE164}`;
}
