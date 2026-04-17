import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fondo: "#f5f5f3",
        borde: "#e8e8e6",
        verde: {
          50:  "#edf8f4",
          100: "#d0ede4",
          200: "#a3daca",
          300: "#6dc4ad",
          400: "#3aaa8d",
          500: "#1D9E75",
          600: "#17825f",
          700: "#12664b",
          800: "#0d4c38",
          900: "#093326",
        },
        pro: {
          50:  "#e6f0ee",
          100: "#c2d9d4",
          200: "#8fbfb5",
          300: "#5ca596",
          400: "#357a6c",
          500: "#085041",
          600: "#064235",
          700: "#04342C",
          800: "#032620",
          900: "#021a16",
        },
        premium: {
          50:  "#fef7e8",
          100: "#faeeda",
          200: "#fad89b",
          300: "#fac775",
          400: "#f5b34a",
          500: "#EF9F27",
          600: "#d18819",
          700: "#a66c12",
          800: "#854F0B",
          900: "#633806",
        },
        urgente: {
          50:  "#fdf0ec",
          100: "#fbd9cf",
          200: "#f5b3a0",
          300: "#ee8c70",
          400: "#e37049",
          500: "#D85A30",
          600: "#C04E28",
          700: "#9e3e1e",
          800: "#7c3015",
          900: "#5a220f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
