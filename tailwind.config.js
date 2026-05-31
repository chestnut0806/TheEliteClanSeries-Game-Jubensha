export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        ink: '#2c1810',
        burgundy: { DEFAULT: '#722f37', light: '#8b3a44' },
        brass: { DEFAULT: '#b5a064' },
        sepia: { DEFAULT: '#5c3d2e', light: '#8b7355' },
        vermilion: { DEFAULT: '#c41e3a' },
        jade: { DEFAULT: '#5b8c5a' },
      },
      fontFamily: {
        title: ['"Noto Serif SC"', 'Songti SC', 'serif'],
        body: ['"Noto Serif SC"', 'Songti SC', 'serif'],
        ui: ['system-ui', '-apple-system', 'sans-serif'],
        game: ['"Noto Serif SC"', 'monospace'],
      },
    },
  },
  plugins: [],
};
