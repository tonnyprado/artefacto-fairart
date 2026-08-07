import { cn } from '@/lib/utils'

/**
 * Componente Select reutilizable
 */

export default function Select({
  label,
  error,
  options = [],
  placeholder = 'Selecciona una opción',
  className,
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
      <select
        style={{ borderRadius: '16px' }}
        className={cn(
          'w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
