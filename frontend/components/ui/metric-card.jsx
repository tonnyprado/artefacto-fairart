'use client'

import { motion } from 'motion/react'
import { AnimatedCounter } from './animated-counter'
import { cn } from '@/lib/utils'

/**
 * Metric Card Component
 * Displays a metric with label, value, context, and optional change indicator
 * Inspired by Arc UI design patterns
 */
export function MetricCard({
  label,
  value,
  context,
  icon: Icon,
  change,
  suffix = '',
  variant = 'default',
  floating = false,
  className = ''
}) {
  const variants = {
    default: {
      gradient: 'from-gray-100 to-gray-200',
      iconColor: 'text-gray-700',
      border: 'border-gray-100 hover:border-gray-300',
      accent: 'from-gray-400 to-gray-600'
    },
    blue: {
      gradient: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
      border: 'border-blue-100 hover:border-blue-300',
      accent: 'from-blue-400 to-blue-600'
    },
    green: {
      gradient: 'from-green-100 to-green-200',
      iconColor: 'text-green-700',
      border: 'border-green-100 hover:border-green-300',
      accent: 'from-green-400 to-green-600'
    },
    purple: {
      gradient: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-700',
      border: 'border-purple-100 hover:border-purple-300',
      accent: 'from-purple-400 to-purple-600'
    },
    orange: {
      gradient: 'from-orange-100 to-orange-200',
      iconColor: 'text-orange-700',
      border: 'border-orange-100 hover:border-orange-300',
      accent: 'from-orange-400 to-orange-600'
    }
  }

  const config = variants[variant] || variants.default

  const getChangeColor = () => {
    if (!change) return ''
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getChangeIcon = () => {
    if (!change) return null
    if (change > 0) return '↑'
    if (change < 0) return '↓'
    return '→'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'group transition-all duration-300',
        !floating && 'bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border',
        !floating && config.border,
        className
      )}
    >
      <div className={!floating ? 'p-6' : ''}>
        <div className="flex items-center justify-between mb-4">
          {Icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className={cn(
                'w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center',
                config.gradient
              )}
            >
              <Icon className={cn('w-6 h-6', config.iconColor)} />
            </motion.div>
          )}
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="mb-2">
          <AnimatedCounter
            value={value}
            suffix={suffix}
            className="text-4xl font-bold text-gray-900"
          />
        </div>

        {context && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{context}</span>
            {change !== undefined && (
              <span className={cn('font-medium flex items-center gap-1', getChangeColor())}>
                {getChangeIcon()} {Math.abs(change)}%
              </span>
            )}
          </div>
        )}
      </div>

      {!floating && <div className={cn('h-1 w-full bg-gradient-to-r', config.accent)}></div>}
    </motion.div>
  )
}
