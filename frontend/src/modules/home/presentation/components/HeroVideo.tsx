import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MediaItem } from '@/modules/media/application/media.models'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

interface HeroVideoProps {
  media: MediaItem | null | undefined
  isLoading?: boolean
  overlay?: 'light' | 'medium' | 'dark'
  blur?: number
}

export function HeroVideo({
  media,
  isLoading = false,
  overlay = 'medium',
  blur = 0,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [blurAmount, setBlurAmount] = useState(0)

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        const scrollY = window.scrollY
        const parallaxValue = scrollY * 0.5
        videoRef.current.style.transform = `translateY(${parallaxValue}px)`

        // Dynamic blur on scroll
        const maxScroll = window.innerHeight * 0.5
        const blurLevel = Math.min((scrollY / maxScroll) * 10, 10)
        setBlurAmount(blurLevel)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const overlayOpacity = {
    light: 'bg-black/40',
    medium: 'bg-black/60',
    dark: 'bg-black/80',
  }

  if (isLoading) {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (!media?.url) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <p className="text-white/60">Contenido no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Video Background with Parallax */}
      <motion.video
        ref={videoRef}
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          'will-change-transform'
        )}
        style={{
          filter: `blur(${Math.min(blurAmount + blur, 20)}px)`,
        }}
      />

      {/* Overlay Gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={cn('absolute inset-0', overlayOpacity[overlay])}
      />

      {/* Additional animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50" />

      {/* Content goes here (will be passed as children from HomePage) */}
      <div className="relative z-10 h-full w-full" />
    </motion.div>
  )
}
