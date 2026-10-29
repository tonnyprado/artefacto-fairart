'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Pulse Indicator Component
 * Animated pulse indicator for live/active status
 * Inspired by Arc UI design patterns
 */
export function PulseIndicator({
  size = 'md',
  color = 'green',
  className = ''
}) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colors = {
    green: {
      dot: 'bg-green-500',
      ring: 'bg-green-400'
    },
    blue: {
      dot: 'bg-blue-500',
      ring: 'bg-blue-400'
    },
    red: {
      dot: 'bg-red-500',
      ring: 'bg-red-400'
    },
    orange: {
      dot: 'bg-orange-500',
      ring: 'bg-orange-400'
    }
  }

  const colorConfig = colors[color] || colors.green

  return (
    <div className={cn('relative inline-flex', className)}>
      <span className={cn('relative inline-flex rounded-full', sizes[size], colorConfig.dot)}>
        <motion.span
          animate={{
            scale: [1, 2, 2, 1],
            opacity: [0.7, 0, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={cn(
            'absolute inline-flex w-full h-full rounded-full opacity-75',
            colorConfig.ring
          )}
        />
      </span>
    </div>
  )
}
