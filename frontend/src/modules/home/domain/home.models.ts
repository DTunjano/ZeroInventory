/**
 * Domain: HomePage Models
 * Entidades de solo lectura para la homepage
 */

export interface HeroContent {
  title: string
  subtitle: string
  cta: {
    authenticated: string
    unauthenticated: string
  }
}

export interface FeatureItem {
  id: string
  icon: string
  title: string
  description: string
}

export interface HomePageConfig {
  hero: HeroContent
  features: FeatureItem[]
}

export const DEFAULT_HOME_CONFIG: HomePageConfig = {
  hero: {
    title: 'Zero Inventory',
    subtitle: 'Gestión inteligente de inventario en tiempo real',
    cta: {
      authenticated: 'Ir al sistema',
      unauthenticated: 'Explorar productos',
    },
  },
  features: [
    {
      id: 'inventory',
      icon: 'Package2',
      title: 'Control de inventario',
      description: 'Gestiona tu inventario con precisión y en tiempo real',
    },
    {
      id: 'analytics',
      icon: 'BarChart3',
      title: 'Analítica inteligente',
      description: 'Obtén insights detallados sobre tus operaciones',
    },
    {
      id: 'speed',
      icon: 'Zap',
      title: 'Gestión en tiempo real',
      description: 'Actualizaciones instantáneas de tu inventario',
    },
  ],
}
