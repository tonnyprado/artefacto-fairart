/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
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
    },
  },
  plugins: [],
}
