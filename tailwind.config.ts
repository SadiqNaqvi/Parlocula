import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '375px',     // small mobile
      'sm': '480px',     // large mobile
      'md': '640px',     // tablets
      'lg': '1024px',    // small laptops
      'xl': '1280px',    // desktops
      '2xl': '1440px',   // large screens
    },
    extend: {},
  },
  plugins: [],
};
export default config;
