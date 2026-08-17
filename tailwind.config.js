/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
};
