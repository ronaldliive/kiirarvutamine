/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zen-bg': '#f0f9ff', // Light blueish
        'zen-card': '#ffffff',
        'zen-text': '#334155', // Slate 700
        'zen-accent': '#38bdf8', // Sky 400
        'zen-success': '#86efac', // Green 300
        'zen-error': '#fca5a5', // Red 300
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Use Inter or system sans
      },
    },
  },
  plugins: [],
}
