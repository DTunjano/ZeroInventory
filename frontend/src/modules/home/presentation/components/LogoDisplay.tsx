import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import barMasterLogo from '@/assets/bar_master.jpg'

interface LogoDisplayProps {
  src?: string
  alt?: string
  className?: string
  showAnimation?: boolean
}

export function LogoDisplay({
  src = barMasterLogo,
  alt = 'Zero Inventory Logo',
  className,
  showAnimation = true,
}: LogoDisplayProps) {
  const hoverProps = showAnimation ? { whileHover: { scale: 1.05 } } : {}

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, scale: 0.9 } : false}
      animate={showAnimation ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={cn('flex items-center justify-center', className)}
    >
      <motion.img
        src={src}
        alt={alt}
        {...hoverProps}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-auto w-full max-w-xs rounded-3xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10"
      />
    </motion.div>
  )
}
