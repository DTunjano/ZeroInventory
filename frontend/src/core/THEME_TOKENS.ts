/**
 * Theme Tokens Reference Guide
 * 
 * This file explains how to use semantic color tokens
 * instead of hardcoded colors. This ensures consistency
 * across light and dark modes.
 */

/**
 * SEMANTIC TOKENS (use these in your components)
 * 
 * These variables are defined in src/index.css and Tailwind config
 * They automatically switch between light/dark modes
 */

// BACKGROUNDS & SURFACES
// --background: Page/container background
// --card: Card/modal backgrounds  
// --surface: Secondary surface (slightly different from card)
// --input: Form input backgrounds
// --popover: Dropdown/popover backgrounds

// TEXT COLORS
// --foreground: Primary text color
// --card-foreground: Text on cards
// --surface-foreground: Text on surfaces
// --popover-foreground: Text on popovers
// --muted-foreground: Secondary/muted text

// FUNCTIONAL COLORS
// --primary: Brand color (blue)
// --secondary: Alternative/secondary actions
// --accent: Highlight color
// --destructive: Delete/danger actions
// --border: Border/divider color
// --input-border: Specifically for input borders
// --ring: Focus ring color

/**
 * USAGE EXAMPLES
 * 
 * ✅ GOOD: Use Tailwind classes with semantic tokens
 */

// Example 1: Card component
// <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
//   Card content
// </div>

// Example 2: Input field
// <input className="bg-input text-foreground border border-input-border rounded-md px-3 py-2" />

// Example 3: Using @apply components from index.css
// <div className="card-base p-6">Automatically themed card</div>
// <div className="surface-base p-4">Automatically themed surface</div>
// <input className="input-base" />

/**
 * ❌ AVOID: Hardcoded colors
 */

// BAD: These won't change with theme
// <div className="bg-white text-black dark:bg-black dark:text-white">
// <div className="bg-blue-500">
// <input className="bg-gray-100 dark:bg-gray-800">

/**
 * 🎨 PALETTE REFERENCE
 */

// LIGHT MODE
// Background: Pure white (#FFFFFF)
// Card: White (#FFFFFF)
// Surface: Light gray (#F5F5F5)
// Text: Dark slate (#1A1F2E)
// Border: Light gray (#E8E8E8)
// Primary: Blue (#3B82F6)

// DARK MODE
// Background: Very dark blue (#0F1A2E)
// Card: Dark gray (#131E3A)
// Surface: Medium dark (#1E293B)
// Text: Near white (#F8F9FC)
// Border: Dark gray (#334155)
// Primary: Light blue (#60A5FA)

/**
 * 📝 CSS VARIABLES
 * 
 * If you need to use CSS variables directly:
 * background-color: hsl(var(--background));
 * color: hsl(var(--foreground));
 * border-color: hsl(var(--border));
 */

/**
 * 🔄 UPDATING COLORS
 * 
 * To change theme colors globally:
 * 1. Edit src/index.css (the :root and .dark selectors)
 * 2. NO changes needed in components
 * 3. All components automatically update
 */

export {}
