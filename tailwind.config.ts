import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      colors: {
        primary: {
          "000": "#FFF5F5",
          100: "#FFE3E3",
          200: "#FFC9C9",
          300: "#FFA8A8",
          400: "#FF8787",
          500: "#FF6B6B",
          600: "#FA5252",
          700: "#F03E3E",
          800: "#E03131",
          900: "#C92A2A",
        },
        gray: {
          "000": "#F8F9FA",
          100: "#F1F3F5",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#868E96",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          "sans-serif",
        ],
      },
    },
  },

  plugins: [],
} satisfies Config;
