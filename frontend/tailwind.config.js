/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#0B0C15", // Fondo profundo (Void)
          800: "#151725", // Paneles secundarios
          700: "#1F2937", // Bordes sutiles
        },
        nebula: {
          500: "#6366f1", // Indigo primario
          400: "#818cf8", // Hover states
        },
        starlight: "#F8FAFC", // Texto principal
        accent: "#22d3ee", // Cyan para elementos destacados (Ciencia)
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Legibilidad máxima para lectura rápida
        mono: ["Fira Code", "monospace"], // Para números y datos
      },
    },
  },
  plugins: [],
};
