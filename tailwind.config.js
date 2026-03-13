import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                base: '#0D1117',
                surface: '#161B22',
                input: '#1C2333',
                subtle: '#2A3040',
                muted: '#3D4450',
                accent: {
                    DEFAULT: '#5DADE2',
                    hover: '#7EC8E3',
                },
                secondary: {
                    DEFAULT: '#E8A317',
                    hover: '#F0B840',
                },
                warm: '#E86A33',
                danger: {
                    DEFAULT: '#DA3633',
                    hover: '#E5534B',
                },
                success: '#2EA043',
            },
            textColor: {
                primary: '#E6EDF3',
                'theme-secondary': '#8B949E',
                'theme-muted': '#565E68',
            },
            fontFamily: {
                display: ['Lexend', ...defaultTheme.fontFamily.sans],
                body: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
        },
    },

    plugins: [forms],
};
