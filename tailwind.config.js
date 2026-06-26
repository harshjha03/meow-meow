/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // semantic tokens — driven by CSS variables (see index.css :root)
        bg: 'var(--bg)',
        card: 'var(--card)',
        soft: 'var(--soft)',
        line: 'var(--line)',
        bd: 'var(--border)',
        track: 'var(--track)',
        ink: 'var(--ink)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        muted2: 'var(--muted2)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        // section accents (fixed across palettes)
        qa: '#6C4DF6',
        varc: '#FF7A45',
        lrdi: '#13B981',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Hanken Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(58,46,28,.05), 0 12px 26px -16px rgba(58,46,28,.22)',
        'card-sm': '0 1px 2px rgba(58,46,28,.06), 0 4px 10px -6px rgba(58,46,28,.14)',
        'card-lg': '0 2px 6px rgba(58,46,28,.06), 0 26px 50px -22px rgba(58,46,28,.34)',
        fab: '0 10px 22px -6px rgba(108,77,246,.75)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        pop: 'pop 0.2s ease-out both',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}
