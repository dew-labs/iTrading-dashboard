/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Note: darkMode config is not needed in v4, using @custom-variant instead
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
