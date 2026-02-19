/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F8FAFC',
                surface: '#FFFFFF',
                border: '#E5E7EB',
                primary: {
                    DEFAULT: '#4F46E5', // Indigo-600
                    hover: '#4338CA',   // Indigo-700
                    light: '#818CF8',   // Indigo-400
                },
                secondary: {
                    DEFAULT: '#0EA5E9', // Sky-500
                    hover: '#0284C7',   // Sky-600
                },
                success: '#16A34A',
                warning: '#F59E0B',
                error: '#DC2626',
                text: {
                    main: '#020617', // Slate-950
                    muted: '#64748B', // Slate-500
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Need to import Inter font in index.css
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 0 0 1px rgba(229, 231, 235, 1), 0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
            },
        },
    },
    plugins: [],
}
