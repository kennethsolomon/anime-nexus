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
                base: 'var(--color-base)',
                surface: 'var(--color-surface)',
                input: 'var(--color-input)',
                subtle: 'var(--color-subtle)',
                muted: 'var(--color-muted)',
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
                primary: 'var(--color-text-primary)',
                'theme-secondary': 'var(--color-text-secondary)',
                'theme-muted': 'var(--color-text-muted)',
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
