/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {}
  },
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#00b666",          // This is DaisyUI's default primary color
					"secondary": "#5b48e7",        // Secondary color
					"accent": "#56fd00",           // Accent color
					"neutral": "#2b3440",          // Neutral color
					"base-100": "#ffffff",         // Base background color
					"info": "#3abff8",            // Information color
					"success": "#36d399",         // Success color
					"warning": "#fbbd23",         // Warning color
					"error": "#f87272",           // Error color
				},
				dark: {
					"primary": "#00b666",          // This is DaisyUI's default primary color
					"secondary": "#5b48e7",        // Secondary color
					"accent": "#56fd00",           // Accent color
					"neutral": "#2b3440",          // Neutral color
					"base-100": "#ffffff",         // Base background color
					"info": "#3abff8",            // Information color
					"success": "#36d399",         // Success color
					"warning": "#fbbd23",         // Warning color
					"error": "#f87272",           // Error color
				},
			},
		],
	},
	plugins: [require("tailwindcss-animate"), require("daisyui")],
}

