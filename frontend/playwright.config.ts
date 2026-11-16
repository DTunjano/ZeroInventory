import { defineConfig, devices } from '@playwright/test'

const run = process.env.E2E_ISOLATED_RUN
function localURL(value: string | undefined) {
  if (!value) throw Error('Ejecuta pnpm test:e2e para crear el entorno aislado')
  const url = new URL(value)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || ['3000', '5173'].includes(url.port))
    throw Error('Las pruebas solo admiten servidores propios en puertos aleatorios')
  return url.origin
}
if (!run || !/^zero_inventory_test_browser_\d+_[a-f0-9]{12}$/.test(run))
  throw Error('Ejecuta pnpm test:e2e; no se permite usar la DB ni los servidores habituales')
localURL(process.env.E2E_API_URL)

export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, forbidOnly: true, retries: 0,
  timeout: 45_000, globalTimeout: 10 * 60_000, expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]], outputDir: 'test-results',
  use: {
    baseURL: localURL(process.env.E2E_BASE_URL), locale: 'es-CO', timezoneId: 'America/Bogota',
    serviceWorkers: 'block', screenshot: 'only-on-failure', trace: 'retain-on-failure', video: 'off',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
})
