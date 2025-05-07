/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            animation: {
                shine: "shine 2s linear infinite",
            },
            keyframes: {
                shine: {
                    from: { backgroundPosition: "0 0" },
                    to: { backgroundPosition: "-200% 0" },
                },
            },
        }
    },
    plugins: []
};