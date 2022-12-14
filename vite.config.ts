/// <reference types="vitest" />
/// <reference types="vite/client" />

import { configDefaults } from "vitest/config";
import { builtinModules } from "node:module";
import { defineConfig } from "vite";
import { resolve } from "node:path";

const allBuiltinModules = builtinModules
	.map((mod) => `node:${mod}`)
	.concat(builtinModules);

export default defineConfig(() => {
	const minify = true;

	return {
		build: {
			rollupOptions: {
				// make sure to externalize deps that shouldn't be bundled
				// into your library
				external: ["esbuild", "electron", "vite", ...allBuiltinModules],
				preserveEntrySignatures: "strict",
				strictDeprecations: true,

				// https://rollupjs.org/guide/en/#big-list-of-options
				output: {
					generatedCode: {
						objectShorthand: true,
						constBindings: true,
						preset: "es2015",
					},
					minifyInternalExports: minify,
					sourcemap: false,
					dir: "./build",
					format: "esm",
				},
			},

			lib: { entry: "src/main.ts", formats: ["es"] },
			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: false,
			sourcemap: false,
			target: "esnext",
			minify,
		},

		esbuild: {
			minifyIdentifiers: minify,
			minifyWhitespace: minify,
			minifySyntax: minify,
			treeShaking: true,
			sourcemap: false,
			target: "esnext",
			platform: "node",
			logLevel: "info",
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
		},

		test: {
			logHeapUsage: true,
			dir: "tests",
			coverage: {
				// reporter: ["html", "text"],
				reporter: ["text"],
				// all: true,
			},
			exclude: [
				...configDefaults.exclude,
				"**/seeLeakedVariables.ts",
				"**/.eslintrc.{js,cjs}",
				"**/styles.ts",
				"**/global.ts",
				"coverage/**",
				"**/*.d.ts",
			],
		},

		resolve: {
			alias: [
				{ find: "@validation", replacement: resolve("src/validation") },
				{ find: "@commands", replacement: resolve("src/commands") },
				{ find: "@plugins", replacement: resolve("src/plugins") },
				{ find: "@common", replacement: resolve("src/common") },
				{ find: "@utils", replacement: resolve("src/utils") },
				{ find: "types", replacement: resolve("src/types") },
				{ find: "@tests", replacement: resolve("tests") },
				{ find: "@src", replacement: resolve("src/") },
			],
		},
	} satisfies ReturnType<typeof defineConfig>;
});
