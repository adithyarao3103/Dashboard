/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
],
theme: {
    extend: {
    colors: {
        primary: {
        DEFAULT: '#6366f1',
        dark: '#4f46e5',
        light: '#818cf8',
        },
    },
    typography: {
        DEFAULT: {
        css: {
            color: '#374151',
            a: {
            color: '#6366f1',
            '&:hover': {
                color: '#4f46e5',
            },
            },
        },
        },
    },
    animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
    },
    keyframes: {
        fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
        },
    },
    },
},
plugins: [
    require('@tailwindcss/typography'),
],
}