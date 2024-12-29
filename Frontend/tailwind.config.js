/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pinyon: ['Pinyon Script', 'cursive'], // Add your custom font
      },
      scrollbar: {
        thin: 'w-2', // 0.5rem
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar')],
};
