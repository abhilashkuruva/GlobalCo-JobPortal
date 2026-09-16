/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GlobalCo Red + White Professional Design System Palette
        primary: "#DC2626",         // Crimson Primary
        "primary-dark": "#B91C1C",    // Deep Red Hover
        "primary-deep": "#991B1B",    // Rich Ruby Active
        "primary-hover": "#EF4444",   // Bright Ruby Accent
        "primary-light": "#FEF2F2",   // Soft Rose Background tint
        "primary-soft": "#FEE2E2",    // Soft Rose Pill Background
        "primary-border": "#FECACA",  // Soft Rose Border
        
        // Neutral Slate / High-Contrast Surfaces
        surface: "#F8FAFC",           // Light Neutral Background
        "surface-card": "#FFFFFF",    // Pure White Card
        "surface-muted": "#F1F5F9",   // Elevated Slate Surface
        "border-subtle": "#E2E8F0",   // Crisp Slate Border
        "border-hover": "#CBD5E1",    // Border on Hover
        
        // Typography Colors
        dark: "#0F172A",              // Deep Slate Text
        "brand-navy": "#0F172A",      // Dark Headline Slate
        "text-main": "#0F172A",       // High-contrast Main Text
        "text-muted": "#64748B",      // Secondary Text
        "text-subtle": "#94A3B8",     // Caption / Timestamp Text
        
        accent: "#DC2626",            // Unified Red Accent
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'red-glow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      }
    },
  },
  plugins: [],
}