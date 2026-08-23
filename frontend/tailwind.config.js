/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    // Breakpoints unificados - usar estos en TODO el proyecto
    screens: {
      'xs': '375px',   // iPhone SE, móviles pequeños
      'sm': '640px',   // Móviles grandes, landscape
      'md': '768px',   // Tablets portrait
      'lg': '1024px',  // Tablets landscape, laptops pequeñas
      'xl': '1280px',  // Laptops, desktops
      '2xl': '1536px', // Desktops grandes
      '3xl': '1920px', // Monitores grandes
      // Breakpoints específicos para touch vs pointer
      'touch': { 'raw': '(pointer: coarse)' },
      'pointer': { 'raw': '(pointer: fine)' },
      // Breakpoint para reduced motion
      'motion-safe': { 'raw': '(prefers-reduced-motion: no-preference)' },
      'motion-reduce': { 'raw': '(prefers-reduced-motion: reduce)' },
    },
    extend: {
      colors: {
        // Colores del branding de ARTE FACTO
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores CONOCE MÁS
        rojo: '#b93232',
        azul: '#3459b6',
        azulclaro: '#7fa3ea',
        gris: '#eaeaea',
        rosa: '#ddd3d3',
        crema: '#F4EDE4',
        tinta: '#2D1515',
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
        serif: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
      },
      // Espaciados responsive usando clamp
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      // Font sizes responsive con clamp
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.6vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 4vw, 4rem)',
      },
      // Altura mínima para secciones
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
      },
      // Padding que respeta safe areas
      padding: {
        'safe': 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      },
    },
  },
  plugins: [],
}
