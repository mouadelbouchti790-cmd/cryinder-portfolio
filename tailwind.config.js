/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', 'SF Pro Text', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        navy: {
          950: '#060C1D',
          900: '#0A111D',
          850: '#0F172A',
          800: '#131C2E',
          700: '#1E293B',
          600: '#27364F',
        },
        chrome: {
          hi: '#FFFFFF',
          mid: '#E2E8F0',
          lo: '#94A3B8',
          dim: '#64748B',
        },
        profit: {
          fill: '#10B981',
          text: '#34D399',
        },
        loss: {
          fill: '#EF4444',
          text: '#FCA5A5',
        },
        ice: '#67E8F9',
      },
      borderRadius: {
        sm: '3px',
        md: '4px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.14), 0 0 24px rgba(103,232,249,0.16)',
        chrome: '0 4px 20px rgba(226,232,240,0.20)',
        e1: '0 1px 2px rgba(0,0,0,0.5)',
        e2: '0 12px 32px rgba(2,6,23,0.6)',
      },
    },
  },
  plugins: [],
};
