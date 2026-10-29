/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        muh: {
          blue: "#0A4D68",
          darkblue: "#088395",
          teal: "#05BFDB",
          light: "#EBF4F6",
          navy: "#022C43",
          gold: "#F5A623",
          emerald: "#10B981"
        }
      }
    },
  },
  plugins: [],
};
