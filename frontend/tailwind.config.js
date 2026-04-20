/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "var(--hot-spacing-large)",
        sm: "var(--hot-spacing-large)",
        md: "var(--hot-spacing-2x-large)",
        lg: "var(--hot-spacing-3x-large)",
        xl: "var(--hot-spacing-4x-large)",
      },
    },
    extend: {
      // HOT Official Colors (CSS variables)
      colors: {
        // Primary colors (red scale)
        "hot-red-950": "var(--hot-color-red-950)",
        "hot-red-900": "var(--hot-color-red-900)",
        "hot-red-800": "var(--hot-color-red-800)",
        "hot-red-700": "var(--hot-color-red-700)",
        "hot-red-600": "var(--hot-color-red-600)", // Main red #D73F3F
        "hot-red-500": "var(--hot-color-red-500)",
        "hot-red-400": "var(--hot-color-red-400)",
        "hot-red-300": "var(--hot-color-red-300)",
        "hot-red-200": "var(--hot-color-red-200)",
        "hot-red-100": "var(--hot-color-red-100)",
        "hot-red-50": "var(--hot-color-red-50)",

        // Secondary colors
        "hot-yellow-600": "var(--hot-color-yellow-600)", // #FAA71E
        "hot-cyan-500": "var(--hot-color-cyan-500)",
        "hot-blue-600": "var(--hot-color-blue-600)",

        // Grays
        "hot-gray-950": "var(--hot-color-gray-950)", // #2C3038
        "hot-gray-900": "var(--hot-color-gray-900)",
        "hot-gray-800": "var(--hot-color-gray-800)",
        "hot-gray-700": "var(--hot-color-gray-700)",
        "hot-gray-600": "var(--hot-color-gray-600)",
        "hot-gray-500": "var(--hot-color-gray-500)",
        "hot-gray-400": "var(--hot-color-gray-400)",
        "hot-gray-300": "var(--hot-color-gray-300)",
        "hot-gray-200": "var(--hot-color-gray-200)",
        "hot-gray-100": "var(--hot-color-gray-100)",
        "hot-gray-50": "var(--hot-color-gray-50)",

        // Semantic colors
        "hot-primary": "var(--hot-color-primary-600)",
        "hot-danger": "var(--hot-color-danger-600)",
        "hot-success": "var(--hot-color-success-600)",
        "hot-warning": "var(--hot-color-warning-600)",
        "hot-neutral": "var(--hot-color-neutral-500)",
      },

      // HOT Official Typography
      fontFamily: {
        sans: ["var(--hot-font-sans)"],
        serif: ["var(--hot-font-sefif)"],
        mono: ["var(--hot-font-mono)"],
      },

      fontSize: {
        "2xs": "var(--hot-font-size-2x-small)",
        xs: "var(--hot-font-size-x-small)",
        sm: "var(--hot-font-size-small)",
        base: "var(--hot-font-size-medium)",
        lg: "var(--hot-font-size-large)",
        xl: "var(--hot-font-size-x-large)",
        "2xl": "var(--hot-font-size-2x-large)",
        "3xl": "var(--hot-font-size-3x-large)",
        "4xl": "var(--hot-font-size-4x-large)",
      },

      fontWeight: {
        light: "var(--hot-font-weight-light)",
        normal: "var(--hot-font-weight-normal)",
        semibold: "var(--hot-font-weight-semibold)",
        bold: "var(--hot-font-weight-bold)",
      },

      // HOT Official Spacing
      spacing: {
        "3xs": "var(--hot-spacing-3x-small)",
        "2xs": "var(--hot-spacing-2x-small)",
        xs: "var(--hot-spacing-x-small)",
        sm: "var(--hot-spacing-small)",
        md: "var(--hot-spacing-medium)",
        lg: "var(--hot-spacing-large)",
        xl: "var(--hot-spacing-x-large)",
        "2xl": "var(--hot-spacing-2x-large)",
        "3xl": "var(--hot-spacing-3x-large)",
        "4xl": "var(--hot-spacing-4x-large)",
      },

      // HOT Official Border Radius
      borderRadius: {
        sm: "var(--hot-border-radius-small)",
        md: "var(--hot-border-radius-medium)",
        lg: "var(--hot-border-radius-large)",
        xl: "var(--hot-border-radius-x-large)",
        full: "var(--hot-border-radius-circle)",
        pill: "var(--hot-border-radius-pill)",
      },

      // Custom animations
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};
