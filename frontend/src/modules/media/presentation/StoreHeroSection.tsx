import { useStoreHeroVideo } from '@/modules/media/application/media.hooks'
import { MediaHero } from '@/modules/media/presentation/MediaHero'
import { cn } from '@/shared/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

interface StoreHeroSectionProps extends ComponentPropsWithoutRef<'div'> {}

export function StoreHeroSection({ className, ...rest }: StoreHeroSectionProps) {
  const { data: heroMedia } = useStoreHeroVideo()

  if (!heroMedia) return null

  return (
    <div
      className={cn('w-full', className)}
      {...rest}
    >
      <MediaHero media={heroMedia} className="w-full" />
    </div>
  )
}
