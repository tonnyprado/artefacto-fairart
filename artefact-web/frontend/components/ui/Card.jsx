import { cn } from '@/lib/utils'

/**
 * Componente Card reutilizable
 * Para mostrar contenido en tarjetas
 */

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-6 border border-gray-100',
        hover && 'transition-all hover:shadow-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-2xl font-bold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('text-gray-600', className)} {...props}>
      {children}
    </div>
  )
}
