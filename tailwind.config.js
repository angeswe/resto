// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Custom colors if needed
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["Menlo", "Monaco", "Courier New", "monospace"],
      },
      spacing: {
        // Custom spacing if needed
      },
      borderRadius: {
        // Custom border radius if needed
      },
      animation: {
        // Custom animations if needed
      },
    },
  },
  plugins: [
    // Add plugins if needed (forms, typography, etc.)
  ],
};
