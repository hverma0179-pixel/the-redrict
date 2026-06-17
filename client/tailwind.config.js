/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        slateText: '#475569',
        panel: '#ffffff',
        line: '#d9e2ec',
        ocean: '#0f766e',
        signal: '#2563eb',
        caution: '#b45309',
        success: '#15803d',
        danger: '#b91c1c'
      },
      boxShadow: {
        panel: '0 18px 55px rgba(15, 23, 42, 0.08)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.06)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
