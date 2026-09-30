/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./resources/js/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#047857',
          container: '#065f46',
          dark: '#064e3b',
          fixed: '#a7f3d0',
          'fixed-dim': '#6ee7b7',
          light: '#ecfdf5',
        },
        secondary: {
          DEFAULT: '#0284c7',
          container: '#38bdf8',
          light: '#f0f9ff',
          fixed: '#bae6fd',
          'fixed-dim': '#7dd3fc',
        },
        tertiary: {
          DEFAULT: '#6366f1',
          container: '#818cf8',
          fixed: '#e0e7ff',
          'fixed-dim': '#c7d2fe',
        },
        surface: {
          DEFAULT: '#f8fafc',
          dim: '#e2e8f0',
          bright: '#ffffff',
          lowest: '#ffffff',
          low: '#f1f5f9',
          container: '#e2e8f0',
          high: '#cbd5e1',
          highest: '#94a3b8',
          variant: '#f1f5f9',
        },
        content: {
          DEFAULT: '#0f172a',
          variant: '#334155',
          muted: '#64748b',
        },
        outline: {
          DEFAULT: '#64748b',
          variant: '#cbd5e1',
        },
        danger: {
          DEFAULT: '#e11d48',
          container: '#ffe4e6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'monospace', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
