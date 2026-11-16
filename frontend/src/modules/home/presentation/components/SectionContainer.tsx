import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface SectionContainerProps {
  children: ReactNode
  className?: string
  id?: string
  fullscreen?: boolean
  variant?: 'default' | 'dark' | 'accent'
}

export function SectionContainer({
  children,
  className,
  id,
  fullscreen = false,
  variant = 'default',
}: SectionContainerProps) {
  const variantStyles = {
    default: 'bg-white/5 backdrop-blur-sm',
    dark: 'bg-gradient-to-b from-slate-950 to-slate-900',
    accent: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      className={cn(
        fullscreen ? 'min-h-screen' : 'min-h-fit',
        'relative w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </motion.section>
  )
}
