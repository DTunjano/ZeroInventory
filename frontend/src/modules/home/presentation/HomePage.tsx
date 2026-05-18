import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package2,
  BarChart3,
  Zap,
  ArrowRight,
} from 'lucide-react'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useHeroVideo } from '../application/home.hooks'
import { DEFAULT_HOME_CONFIG } from '../domain/home.models'

import { Button } from '@/shared/ui/button'
import { HeroVideo } from './components/HeroVideo'
import { LogoDisplay } from './components/LogoDisplay'
import { FeatureCard } from './components/FeatureCard'
import { SectionContainer } from './components/SectionContainer'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = !!user

  // Fetch hero video
  const { data: heroVideo, isLoading } = useHeroVideo()

  // Get config
  const config = DEFAULT_HOME_CONFIG

  // Determine CTA button text
  const ctaText = isAuthenticated ? config.hero.cta.authenticated : config.hero.cta.unauthenticated
  const ctaHref = isAuthenticated ? '/admin/products' : '/login'

  // Icon map for features
  const iconMap = {
    Package2: <Package2 className="h-6 w-6" />,
    BarChart3: <BarChart3 className="h-6 w-6" />,
    Zap: <Zap className="h-6 w-6" />,
  } as Record<string, JSX.Element>

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {/* Background Video */}
        <HeroVideo
          media={heroVideo}
          isLoading={isLoading}
          overlay="medium"
          blur={0}
        />
      </section>

      {/* ===== COMPANY BRANDING SECTION ===== */}
      <SectionContainer
        id="branding"
        variant="dark"
        fullscreen={false}
        className="py-24"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center"
          >
            {/* Logo */}
            <LogoDisplay
              alt="Zero Inventory Logo"
              className="h-auto max-w-md"
              showAnimation
            />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <motion.h2
                  className="text-4xl font-bold text-white sm:text-5xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Software a medida para tu negocio
                </motion.h2>
              </div>

              <motion.p
                className="text-lg leading-relaxed text-white/70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Zero Inventory es una plataforma especializada diseñada específicamente para 
                tu empresa. Automatiza y digitaliza todos tus procesos operacionales, permitiendo 
                una integración completa entre gestión de inventario, análisis de datos y control 
                de personal.
              </motion.p>

              <motion.p
                className="text-lg leading-relaxed text-white/60"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Con herramientas inteligentes adaptadas a tus necesidades específicas, puedes 
                centralizar toda la información relevante, tomar mejores decisiones en tiempo real 
                y optimizar cada aspecto de tu operación con precisión y eficiencia.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button
                  onClick={() => navigate(ctaHref)}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-white hover:from-blue-400 hover:to-cyan-400"
                >
                  Comenzar ahora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* ===== FEATURES SECTION ===== */}
      <SectionContainer
        id="features"
        variant="default"
        className="py-24 lg:py-32"
      >
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="text-4xl font-bold text-white sm:text-5xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Lo que te ofrecemos
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-white/60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Características diseñadas para mejorar tu productividad
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {config.features.map((feature, index) => (
              <motion.div key={feature.id} variants={itemVariants}>
                <FeatureCard
                  icon={
                    iconMap[feature.icon as keyof typeof iconMap] || (
                      <Package2 className="h-6 w-6" />
                    )
                  }
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionContainer>

      {/* ===== CTA SECTION ===== */}
      <SectionContainer
        id="cta"
        variant="accent"
        className="py-24 lg:py-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            ¿Listo para transformar tu inventario?
          </h2>
          <p className="mt-6 text-lg text-white/70">
            Únete a cientos de empresas que confían en Zero Inventory para
            optimizar sus operaciones.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate(ctaHref)}
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6 text-white hover:from-blue-400 hover:to-cyan-400"
            >
              {ctaText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </SectionContainer>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-between gap-6 sm:flex-row"
          >
            <div className="text-center text-sm text-white/60 sm:text-left">
              <p>© 2024 Zero Inventory. Todos los derechos reservados.</p>
            </div>
            <div className="text-center text-xs text-white/40">
              <p>v1.0.0</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
