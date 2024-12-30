/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			transitionProperty: {
				'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
			}
		},
	},
	plugins: [],
	darkMode: 'class',
}
