/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'touch': { 'raw': '(hover: none)' },
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                russo: ['Russo One', 'sans-serif'],
                noto: ['Noto Sans JP', 'sans-serif'],
                mono: ['Roboto Mono', 'monospace'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.6s ease-out',
                'shake': 'shake 0.5s ease-in-out',
                'ripple': 'ripple 1.2s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { filter: 'drop-shadow(0 0 10px currentColor)' },
                    '50%': { filter: 'drop-shadow(0 0 30px currentColor)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(50px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
                'ripple': {
                    '0%': { transform: 'scale(0.5)', opacity: '0.8' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
