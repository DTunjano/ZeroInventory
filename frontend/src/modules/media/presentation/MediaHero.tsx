import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { MediaItem } from '@/modules/media/application/media.models'

interface MediaHeroProps {
  media: MediaItem | null | undefined
  className?: string
}

export function MediaHero({ media, className }: MediaHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !media) return

    video.muted = isMuted
    const playPromise = video.play()
    if (playPromise) playPromise.catch(() => undefined)
  }, [media, isMuted])

  if (!media) return null

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_30px_120px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={media.url}
          className="h-full w-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="max-w-2xl space-y-3 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md sm:p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Video promocional
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{media.titulo}</h2>
              {media.descripcion ? <p className="max-w-xl text-sm leading-6 text-white/75 sm:text-base">{media.descripcion}</p> : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/45 focus:outline-none"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

      </div>
    </div>
  )
}
