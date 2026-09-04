/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        sbt: {
          blue: '#2650ff',
          red: '#f9423a',
          grey1: '#3c4858',
          grey2: '#717e8f',
          grey3: '#aeb9c6',
          grey4: '#dfe3ed',
          grey5: '#f7f8fb',
        },
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
