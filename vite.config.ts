import { type UserConfigExport, defineConfig } from "vite";

import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isTest = mode === "test";
	const isProd = !isTest && !isDev;

	const config: UserConfigExport = {
		build: {
			lib: { entry: "src/main.ts", formats: ["es"] },

			rollupOptions: {
				// make sure to externalize deps that shouldn't be bundled
				// into your library
				external: [
					"node:child_process",
					"node:fs/promises",
					"node:perf_hooks",
					"node:readline",
					"node:stream",
					"node:buffer",
					"node:module",
					"node:crypto",
					"node:https",
					"node:http",
					"node:path",
					"node:util",
					"node:zlib",
					"node:url",
					"node:dns",
					"node:fs",
					"module",
					"util",
					"path",
					"url",
					"fs",
				],
				treeshake: true,

				output: {
					minifyInternalExports: isProd,
					sourcemap: !isProd,
					compact: isProd,
					dir: "./build",
					format: "esm",
				},
			},

			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			sourcemap: !isProd,
			emptyOutDir: true,
			minify: "esbuild",
			target: "esnext",
		},

		esbuild: {
			minifyWhitespace: true,
			minifySyntax: true,
			sourcemap: !isProd,
			treeShaking: true,
			target: "node16",
			format: "esm",
		},

		// test: {
		// 	dir: "src/__tests__",
		// 	logHeapUsage: true,
		// 	coverage: {
		// 		// reporter: ["html", "text"],
		// 		reporter: ["text"],
		// 		// all: true,
		// 	},
		// 	exclude: [
		// 		...configDefaults.exclude,
		// 		"**/seeLeakedVariables.ts",
		// 		"**/.eslintrc.{js,cjs}",
		// 		"**/styles.ts",
		// 		"**/global.ts",
		// 		"coverage/**",
		// 		"**/*.d.ts",
		// 	],
		// },

		resolve: {
			alias: [
				{ find: "#validation", replacement: resolve("src/validation") },
				{ find: "#commands", replacement: resolve("src/commands") },
				{ find: "#common", replacement: resolve("src/common") },
				{ find: "#types", replacement: resolve("src/#types") },
				{ find: "#utils", replacement: resolve("src/utils") },
			],
		},
	};

	return config;
});
