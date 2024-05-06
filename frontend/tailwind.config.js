const flowbite = require('flowbite-react/tailwind');
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', flowbite.content()],
  theme: {
    extend: {},
    screens: {
      xs: '492px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    container: {
      padding: {
        sm: '2rem',
        md: '2rem',
        lg: '6rem',
        xl: '6rem',
        '2xl': '14rem',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [flowbite.plugin()],
};
