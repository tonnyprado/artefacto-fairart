'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Empty State Component
 * Displays a message when there's no data to show
 * Inspired by Arc UI design patterns
 */
export function EmptyState({
  icon: Icon,
  title = 'No hay datos',
  description,
  action,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center"
        >
          <Icon className="w-8 h-8 text-gray-400" />
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
