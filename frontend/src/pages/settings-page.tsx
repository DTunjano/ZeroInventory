export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Configuración</h1>
        <p className="mt-2 text-lg text-zinc-300">
          Ajustes generales de tu cuenta y preferencias visuales.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-zinc-300">
        Esta sección está disponible para todos los roles.
      </div>
    </div>
  )
}