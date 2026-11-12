/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          raised: '#1a2332',
          overlay: '#243044'
        },
        ink: {
          DEFAULT: '#e8eef6',
          muted: '#9aadc2',
          faint: '#6b7f96'
        },
        accent: {
          DEFAULT: '#3d9bfd',
          soft: '#1e4a7a'
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
