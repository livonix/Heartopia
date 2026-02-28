
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // Cible App.tsx et index.tsx à la racine
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
