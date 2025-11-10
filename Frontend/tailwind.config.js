/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'kite-one': ['"Kite One"', 'serif'],
        'khula': ['"Khula"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
