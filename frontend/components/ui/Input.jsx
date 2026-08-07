import { cn } from '@/lib/utils'

/**
 * Componente Input reutilizable
 * Para formularios
 */

export default function Input({
  label,
  error,
  className,
  type = 'text',
  required = false,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: '#F4EDE4' }}>
          {label}
          {required && <span style={{ color: '#FEE2E2', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        style={{ borderRadius: '16px' }}
        className={cn(
          'w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900 bg-white',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function Textarea({
  label,
  error,
  className,
  required = false,
  rows = 4,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: '#F4EDE4' }}>
          {label}
          {required && <span style={{ color: '#FEE2E2', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        style={{ borderRadius: '16px' }}
        className={cn(
          'w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none text-gray-900 bg-white',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
