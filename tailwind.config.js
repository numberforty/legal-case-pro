/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          arabic: ['Cairo', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      // RTL support plugin
      function({ addUtilities }) {
        const newUtilities = {
          '.rtl': {
            direction: 'rtl',
          },
          '.ltr': {
            direction: 'ltr',
          },
          '.rtl .space-x-reverse > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-x-reverse': '1',
          },
          '.rtl .divide-x-reverse > :not([hidden]) ~ :not([hidden])': {
            '--tw-divide-x-reverse': '1',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  }