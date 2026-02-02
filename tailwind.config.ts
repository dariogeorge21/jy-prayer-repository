import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Spiritual color palette
        primary: {
          50: '#f5f3f0',
          100: '#e8e3dc',
          200: '#d4c7b8',
          300: '#bea78f',
          400: '#a88b6b',
          500: '#8B7355', // Main brand color
          600: '#7a6349',
          700: '#64503c',
          800: '#4d3d2e',
          900: '#3a2e22',
        },
        accent: {
          50: '#fefcf3',
          100: '#fef7d8',
          200: '#fdedaa',
          300: '#fce182',
          400: '#fad147',
          500: '#D4AF37', // Gold accent
          600: '#b8962e',
          700: '#987a24',
          800: '#7a6120',
          900: '#5e4a19',
        },
        surface: {
          DEFAULT: '#1a1a1a',
          elevated: '#242424',
          overlay: '#2e2e2e',
        },
        background: {
          DEFAULT: '#0f0f0f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

export default config
