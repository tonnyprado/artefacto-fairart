/**
 * Filtro de palabras prohibidas para opiniones públicas
 * Lista de groserías e insultos en español
 */

const badWords = [
  // Groserías comunes
  'puta', 'puto', 'pendejo', 'pendeja', 'cabron', 'cabrona', 'chingar', 'chingada',
  'chingado', 'verga', 'pene', 'culo', 'mierda', 'caca', 'cagar', 'cagada',
  'joder', 'jodido', 'jodida', 'coño', 'carajo', 'mamada', 'mamar', 'mamon',
  'mamona', 'huevon', 'huevona', 'idiota', 'imbecil', 'estupido', 'estupida',
  'tarado', 'tarada', 'baboso', 'babosa', 'menso', 'mensa', 'tonto', 'tonta',
  'zorra', 'perra', 'bastardo', 'bastarda', 'hijo de puta', 'hijueputa',
  'malparido', 'malparida', 'gonorrea', 'marica', 'maricon', 'joto', 'puñal',
  'culero', 'culera', 'nalgas', 'trasero', 'ano', 'prostit', 'porno',
  'sexo', 'coger', 'follar', 'culear', 'pinche', 'chingon', 'chingona',
  'madrazo', 'putazo', 'vergazo', 'chingadera', 'mamadas', 'pendejada',
  'cojudo', 'cojuda', 'huevudo', 'webudo', 'webear', 'webeo',
  // Insultos racistas/discriminatorios
  'negro', 'negra', 'indio', 'india', 'naco', 'naca', 'prieto', 'prieta',
  // Variantes con acentos y sustituciones comunes
  'put4', 'p3ndejo', 'c4bron', 'v3rga', 'm13rda', 'ch1ng4', 'pend3jo',
  // Inglés común
  'fuck', 'shit', 'bitch', 'ass', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'bastard', 'damn', 'crap', 'idiot', 'stupid', 'dumb', 'retard'
];

/**
 * Normaliza texto para comparación
 * Remueve acentos, convierte a minúsculas, reemplaza números por letras
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z\s]/g, ' '); // Solo letras y espacios
}

/**
 * Verifica si el texto contiene palabras prohibidas
 * @param {string} text - Texto a verificar
 * @returns {boolean} - true si contiene palabras prohibidas
 */
export function containsBadWords(text) {
  if (!text || typeof text !== 'string') return false;

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  // Verificar palabras individuales
  for (const word of words) {
    if (badWords.includes(word)) {
      return true;
    }
  }

  // Verificar frases compuestas en el texto completo
  for (const badWord of badWords) {
    if (badWord.includes(' ') && normalized.includes(badWord)) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica si el contenido es apropiado (no contiene spam, solo espacios, etc.)
 * @param {string} text - Texto a verificar
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateContent(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'El texto es requerido' };
  }

  const trimmed = text.trim();

  if (trimmed.length < 5) {
    return { valid: false, error: 'La opinión es muy corta (mínimo 5 caracteres)' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'La opinión excede el límite de 100 caracteres' };
  }

  // Verificar si es solo números o caracteres repetidos
  if (/^(.)\1+$/.test(trimmed)) {
    return { valid: false, error: 'Contenido no válido' };
  }

  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'La opinión no puede ser solo números' };
  }

  if (containsBadWords(trimmed)) {
    return { valid: false, error: 'El contenido contiene palabras inapropiadas' };
  }

  return { valid: true };
}

/**
 * Valida el nombre del usuario
 * @param {string} name - Nombre a validar
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es requerido' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre es muy corto (mínimo 2 caracteres)' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'El nombre excede el límite de 50 caracteres' };
  }

  // Solo letras, espacios y algunos caracteres especiales
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no válidos' };
  }

  if (containsBadWords(trimmed)) {
    return { valid: false, error: 'El nombre contiene palabras inapropiadas' };
  }

  return { valid: true };
}

export default {
  containsBadWords,
  validateContent,
  validateName
};
