'use client'

import { useState } from 'react'

/**
 * Hook simple para mostrar notificaciones tipo toast
 * Implementación básica compatible con shadcn/ui
 */
export function useToast() {
  const toast = ({ title, description, variant = 'default' }) => {
    // Por ahora usa console.log, puede mejorarse con react-hot-toast o shadcn/ui toast
    const emoji = variant === 'destructive' ? '❌' : '✅'
    const message = `${emoji} ${title}${description ? ': ' + description : ''}`

    console.log(message)

    // También mostrar un alert visual para el usuario
    if (typeof window !== 'undefined') {
      // Usar alert solo para errores críticos
      if (variant === 'destructive') {
        alert(message)
      }
    }
  }

  return { toast }
}
