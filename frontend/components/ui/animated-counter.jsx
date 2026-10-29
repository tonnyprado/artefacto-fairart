'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'motion'

/**
 * Animated Counter Component
 * Counts up from 0 to the target value with smooth animation
 * Inspired by Arc UI design patterns
 */
export function AnimatedCounter({
  value,
  duration = 1,
  suffix = '',
  className = ''
}) {
  const nodeRef = useRef(null)
  const previousValue = useRef(0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const from = previousValue.current
    const to = value || 0

    const controls = animate(from, to, {
      duration,
      onUpdate(latest) {
        node.textContent = Math.floor(latest).toLocaleString('es-MX') + suffix
      },
    })

    previousValue.current = to

    return () => controls.stop()
  }, [value, duration, suffix])

  return (
    <span ref={nodeRef} className={className}>
      {(value || 0).toLocaleString('es-MX')}{suffix}
    </span>
  )
}
