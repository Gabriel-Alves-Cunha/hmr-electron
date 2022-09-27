import { type UserConfigExport, defineConfig } from "vite";

import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isTest = mode === "test";
	const isProd = !isTest && !isDev;
	const isPreview = false;

	const config: UserConfigExport = {
		build: {
			rollupOptions: {
				// make sure to externalize deps that shouldn't be bundled
				// into your library
				external: [
					"esbuild",
					"vite",

					"node:child_process",
					"node:fs/promises",
					"node:querystring",
					"node:perf_hooks",
					"node:readline",
					"node:stream",
					"node:buffer",
					"node:module",
					"node:crypto",
					"node:assert",
					"node:events",
					"node:buffer",
					"node:https",
					"node:http",
					"node:path",
					"node:util",
					"node:zlib",
					"node:net",
					"node:tls",
					"node:url",
					"node:dns",
					"node:tty",
					"node:os",
					"node:fs",

					"child_process",
					"fs/promises",
					"querystring",
					"perf_hooks",
					"readline",
					"stream",
					"buffer",
					"module",
					"crypto",
					"assert",
					"events",
					"buffer",
					"https",
					"http",
					"path",
					"util",
					"zlib",
					"net",
					"tls",
					"url",
					"dns",
					"tty",
					"fs",
					"os",
					"fs",
				],
				preserveEntrySignatures: "strict",
				strictDeprecations: true,

				// https://rollupjs.org/guide/en/#big-list-of-options
				output: {
					minifyInternalExports: isPreview ? false : isProd,
					sourcemap: isPreview ? false : !isProd,
					generatedCode: "es2015",
					dir: "./build",
					format: "esm",
				},
			},

			lib: { entry: "src/main.ts", formats: ["es"] },
			sourcemap: isPreview ? true : !isProd,
			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: true,
			minify: "esbuild",
			target: "esnext",
		},

		esbuild: {
			minifyWhitespace: isPreview ? false : isProd,
			minifySyntax: isPreview ? false : isProd,
			sourcemap: isPreview ? true : !isProd,
			treeShaking: true,
			target: "esnext",
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

	log(config);

	return config;
});

const log = (...args: unknown[]): void => {
	console.dir(...args, {
		maxStringLength: 1_000,
		maxArrayLength: 100,
		compact: false,
		sorted: false,
		colors: true,
		depth: 10,
	});
};
