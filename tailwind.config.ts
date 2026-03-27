import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos Águilas del Sol
        primary: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          DEFAULT: '#0a0a0a',
          light: '#1a1a2e',
          lighter: '#2a2a4e',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          dark: '#991b1b',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
        },
        warning: {
          DEFAULT: '#eab308',
          light: '#facc15',
          dark: '#ca8a04',
        },
        background: {
          DEFAULT: '#0a0a0a',
          card: '#1a1a2e',
          hover: '#2a2a4e',
        },
        border: {
          DEFAULT: '#2a2a4e',
          light: '#3a3a5e',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-emergency': 'pulse-emergency 1s ease-in-out infinite',
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-emergency': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)',
            transform: 'scale(1.02)',
          },
        },
        'border-pulse': {
          '0%, 100%': { borderColor: '#dc2626' },
          '50%': { borderColor: '#ef4444' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
