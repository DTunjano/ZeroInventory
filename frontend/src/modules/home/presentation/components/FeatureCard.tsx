import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
  index?: number
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay + index * 0.1,
        ease: 'easeOut',
      }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
      className={cn(
        'group relative h-full min-h-[230px] overflow-hidden rounded-2xl',
        'border border-white/10 bg-white/5 backdrop-blur-md',
        'p-8 transition-all duration-300',
        'hover:border-blue-400/50 hover:bg-blue-500/10',
      )}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10"
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col space-y-4">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-white/80 group-hover:text-blue-300"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-white/60 transition-colors group-hover:text-white/80">
          {description}
        </p>
      </div>

      {/* Border gradient effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20"
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
