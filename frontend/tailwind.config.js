/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    safelist: [
        {
            pattern: /hljs+/,
        },
    ],
    theme: {
        extend: {},
        hljs: {
            theme: "stackoverflow-dark",
        },
    },
    plugins: [require("tailwind-highlightjs")],
};
// tailwind.config.js
