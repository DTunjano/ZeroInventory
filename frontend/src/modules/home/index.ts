// Presentation
export { HomePage } from './presentation/HomePage'

// Components
export { HeroVideo } from './presentation/components/HeroVideo'
export { LogoDisplay } from './presentation/components/LogoDisplay'
export { FeatureCard } from './presentation/components/FeatureCard'
export { SectionContainer } from './presentation/components/SectionContainer'

// Application
export { useHeroVideo, useActiveMediaList } from './application/home.hooks'

// Domain
export { DEFAULT_HOME_CONFIG, type HeroContent, type FeatureItem, type HomePageConfig } from './domain/home.models'
