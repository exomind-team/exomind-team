/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007aff',
        'primary-dark': '#0056b3',
        background: '#f2f2f7',
        card: '#ffffff',
        text: '#000000',
        'text-secondary': '#8e8e93',
        border: '#e5e5ea',
      },
    },
  },
  plugins: [],
}
