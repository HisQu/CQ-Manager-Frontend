import colors from 'tailwindcss/colors'
import plugin from 'tailwindcss/plugin'

// The app's accent is the `indigo` palette. It is read from CSS variables so the dev server
// can swap it for a different palette (see src/main.ts) and is never mistaken for production.
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

const rgbChannels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')
const accentVariables = (palette) =>
  Object.fromEntries(shades.map((shade) => [`--color-accent-${shade}`, rgbChannels(palette[shade])]))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: Object.fromEntries(
          shades.map((shade) => [shade, `rgb(var(--color-accent-${shade}) / <alpha-value>)`]),
        ),
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(({ addBase }) => addBase({
      ':root': accentVariables(colors.indigo),
      ':root.dev-environment': accentVariables(colors.orange),
    })),
  ],
}
