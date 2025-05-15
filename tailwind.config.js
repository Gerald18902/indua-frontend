/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 NECESARIO para modo oscuro por clase
  theme: {
    extend: {},
  },
  plugins: [],
}
