<!-- Sistema de Theming Profersional: Guía de Uso -->

# 🎨 Sistema de Theming Profersional - Implementación Completada

## 📊 Resumen de lo Que Se Hizo

Tu aplicación ahora tiene un sistema de theming **arquitectónicamente correcto** que:

✅ **Usa variables CSS (tokens semánticos)** - NO colores hardcodeados
✅ **Cambia globalmente desde `index.css`** - Sin tocar componentes
✅ **Soporta light/dark mode automáticamente** - Con preferencia del usuario
✅ **Sin breaking changes** - Todo lo antiguo sigue funcionando
✅ **Paleta profesional** - Blanco + azul para light, oscuro + azul para dark

---

## 🎯 Paletas de Color

### Light Mode (Nuevo)
```
Fondo:        Blanco puro (#FFFFFF)
Card:         Blanco (#FFFFFF)
Surface:      Gris muy claro (#F5F5F5)
Texto:        Gris oscuro profesional (#1A1F2E)
Bordes:       Gris claro (#E8E8E8)
Primario:     Azul brand (#3B82F6)
Acento:       Azul (#3B82F6)
```

### Dark Mode (Preservado)
```
Fondo:        Azul muy oscuro (#0F1A2E)
Card:         Gris oscuro (#131E3A)
Surface:      Gris medio (#1E293B)
Texto:        Blanco casi puro (#F8F9FC)
Bordes:       Gris oscuro (#334155)
Primario:     Azul claro (#60A5FA)
Acento:       Azul brillante (#60A5FA)
```

---

## 🚀 Cómo Usar en Componentes

### ✅ NUEVO: Usa Variables CSS (Recomendado)

```tsx
// Forma 1: Directamente en className
<div className="bg-card text-card-foreground border border-border p-4">
  Contenido
</div>

// Forma 2: Usando clases @apply predefinidas
<div className="card-base p-6">Tarjeta</div>
<div className="surface-base p-4">Superficie</div>
<input className="input-base" />
```

### ❌ EVITA: Colores Hardcodeados

```tsx
// NO HAGAS ESTO (cambiará con modo oscuro incorrectamente):
<div className="bg-white text-black dark:bg-black dark:text-white">
<div className="bg-blue-500">
<input className="bg-gray-100">
```

---

## 📝 Tokens Disponibles

Puedes usar estos en `className`:

| Clase | Uso | Light | Dark |
|-------|-----|-------|------|
| `bg-background` | Fondo general | Blanco | #0F1A2E |
| `bg-card` | Tarjetas/modales | Blanco | #131E3A |
| `bg-surface` | Superficie secundaria | Gris claro | #1E293B |
| `text-foreground` | Texto principal | Gris oscuro | Blanco |
| `text-card-foreground` | Texto en cards | Gris oscuro | Blanco |
| `border-border` | Bordes | Gris claro | Gris oscuro |
| `bg-input` | Inputs/textareas | Blanco | #1E293B |
| `bg-primary` | Botones primary | Azul | Azul |
| `text-muted` | Texto secundario | Gris medio | Gris claro |

---

## 🔄 Cambiar Colores Globalmente

Si necesitas ajustar la paleta en el futuro:

**Edita**: `frontend/src/index.css`

**Ubicación de variables**:
- Light mode: `:root { --color: ... }`
- Dark mode: `.dark { --color: ... }`

**Ejemplo**: Cambiar el azul primario

```css
:root {
  --primary: 210 99% 50%; /* Aquí cambias el azul light */
}

.dark {
  --primary: 210 99% 60%; /* Aquí cambias el azul dark */
}
```

✨ **Listo**: Toda la app se actualiza automáticamente, sin tocar componentes.

---

## 💡 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `src/index.css` | Variables CSS y tokens base |
| `src/core/theme.ts` | Lógica centralizada de theming |
| `tailwind.config.cjs` | Configuración Tailwind (ya está bien) |
| `src/modules/settings/application/settings.store.ts` | Estado del tema (Zustand) |

---

## 🔧 API de Tema (Para cambiar tema programáticamente)

### Desde `src/core/theme.ts`

```tsx
import { toggleTheme, applyTheme, getCurrentTheme } from '@/core/theme'

// Cambiar a dark
applyTheme('dark')

// Cambiar a light
applyTheme('light')

// Alternar
toggleTheme()

// Obtener actual
const current = getCurrentTheme() // 'light' | 'dark'
```

### Desde componentes (con Zustand)

```tsx
import { useSettingsStore } from '@/modules/settings/application/settings.store'

export function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
```

---

## ✨ Características

✅ **Persistencia**: El tema se guarda en `localStorage`
✅ **Detección del Sistema**: Si no hay preferencia guardada, usa la del SO
✅ **Sincronización**: Observa cambios del sistema operativo
✅ **Transiciones Suaves**: 200ms `ease` entre cambios
✅ **Sin Parpadeos**: Se aplica antes de renderizar
✅ **Accesible**: Respeta `prefers-color-scheme` media query

---

## 🚦 Migración de Componentes (Opcional)

No necesitas cambiar nada ya. Pero si quieres migrar componentes existentes:

### Antes (antigua forma)
```tsx
<div className="bg-white dark:bg-black text-black dark:text-white border border-gray-200 dark:border-gray-700">
```

### Después (nueva forma)
```tsx
<div className="bg-card text-card-foreground border border-border">
```

↔️ **Ventaja**: 1 línea de Tailwind vs múltiples clases `dark:`

---

## ⚙️ Cómo Funciona Internamente

1. **Al iniciar**: `initializeTheme()` en `settings.store.ts`
2. **Busca**: localStorage → preferencia sistema → default (dark)
3. **Aplica**: Añade/quita clase `.dark` al `<html>`
4. **Variables CSS**: El selector `.dark` en `index.css` cambia todas las variables
5. **Tailwind**: Usa `hsl(var(--background))` → se actualiza automáticamente
6. **Componentes**: Reciben los nuevos colores sin cambios de código

---

## 📚 Referencias

- **CSS Variables Guide**: Usa `var(--nombre-variable)` en cualquier propiedad CSS
- **Tailwind Tokens**: `bg-card`, `text-foreground`, etc. funcionan igual que `bg-blue-500`
- **Color Format**: HSL (Hue, Saturation, Lightness) - es mejor que RGB para theming

---

## 🎉 Conclusión

Tu app ahora tiene un sistema de theming:
- ✅ Profesional
- ✅ Mantenible
- ✅ Sin código duplicado
- ✅ Escalable
- ✅ Accesible

**Para cambiar la paleta**: Edita `index.css`, nada más.
**Para usar nuevos componentes**: Usa `bg-card`, `text-foreground`, etc.
**Todo funciona**: Light mode, dark mode, transiciones, persistencia.

🚀 ¡Listo para producción!
