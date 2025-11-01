import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tactical: {
          green: '#00FF41',
          'green-dim': '#00CC33',
          'green-dark': '#009922',
        },
        bg: {
          primary: '#0A0A0A',
          secondary: '#121212',
          tertiary: '#1A1A1A',
        },
        accent: {
          red: '#FF3333',
          blue: '#3399FF',
          yellow: '#FFCC00',
          orange: '#FF6600',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;