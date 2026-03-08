module.exports = {
    content: [
        './src/frontend/**/*.{html,ts,scss}',
    ],
    theme: {
        extend: {
            colors: {
                'brand-bg': '#0a0f24',        // deep navy background
                'brand-surface': '#151b3b',   // darker card surface
                'brand-accent': '#ff4d4d',    // vivid red accent
                'brand-accent-hover': '#ff6b6b',
                'brand-text': '#e0e0e0',      // light text on dark backgrounds
            }
        }
    },
    plugins: [],
};
