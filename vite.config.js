import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			//$lib: resolve("src/lib"),
			$components: resolve("src/components"),
			$stores: resolve("src/stores"),
			$types: resolve("src/types"),
			$transitions: resolve("src/transitions")
		}
	}
};

export default config;
