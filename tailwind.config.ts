import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#ffc2d4',
          300: '#ff94b4',
          400: '#ff5b8b',
          500: '#ef2d6c',
          600: '#d61a59',
          700: '#b41149',
          800: '#921040',
          900: '#7a1239'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
