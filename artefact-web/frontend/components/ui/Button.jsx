import { cn } from '@/lib/utils'

/**
 * Componente Button reutilizable
 *
 * Variantes disponibles:
 * - primary: Botón principal (rojo ARTEFACT)
 * - secondary: Botón secundario (outline)
 * - ghost: Botón transparente
 *
 * Tamaños:
 * - sm: Pequeño
 * - md: Mediano (default)
 * - lg: Grande
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    secondary: 'border-2 border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
