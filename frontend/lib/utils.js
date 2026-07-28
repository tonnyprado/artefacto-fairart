import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS sin conflictos
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio a formato de moneda
 */
export function formatPrice(price, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

/**
 * Formatea una fecha a formato legible
 */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    ...options,
  }).format(new Date(date))
}

/**
 * Genera un slug a partir de un string
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Trunca un texto a un número de caracteres
 */
export function truncate(text, length = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
