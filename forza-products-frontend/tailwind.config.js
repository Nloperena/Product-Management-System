/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forza: {
          blue: '#1e40af',
          'blue-dark': '#1e3a8a',
          'blue-light': '#3b82f6',
          gray: '#6b7280',
          'gray-light': '#f3f4f6',
          'gray-dark': '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    '@tailwindcss/forms',
    '@tailwindcss/typography',
  ],
})
