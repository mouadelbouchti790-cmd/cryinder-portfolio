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
        base: '#0B0F19',
        surface: '#111827',
        line: '#1F2937',
        navy: {
          950: '#0B0F19',
          900: '#0F172A',
          850: '#111827',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
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
        ice: '#3B82F6',
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          soft: '#93C5FD',
          dark: '#2563EB',
          deep: '#1D4ED8',
        },
      },
      borderRadius: {
        sm: '3px',
        md: '4px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.35), 0 0 24px rgba(59,130,246,0.25)',
        chrome: '0 4px 20px rgba(226,232,240,0.20)',
        e1: '0 1px 2px rgba(0,0,0,0.5)',
        e2: '0 12px 32px rgba(2,6,23,0.6)',
      },
    },
  },
  plugins: [],
};
