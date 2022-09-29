import { type UserConfigExport, defineConfig } from "vite";
import { builtinModules } from "node:module";
import { resolve } from "node:path";

const builtinModulesWithNode = builtinModules.map(mod => `node:${mod}`);
const allBuiltinModules = builtinModulesWithNode.concat(builtinModules);

export default defineConfig(() => {
	const config: UserConfigExport = {
		build: {
			rollupOptions: {
				// make sure to externalize deps that shouldn't be bundled
				// into your library
				external: ["esbuild", "vite", ...allBuiltinModules],
				preserveEntrySignatures: "strict",
				strictDeprecations: true,

				// https://rollupjs.org/guide/en/#big-list-of-options
				output: {
					generatedCode: {
						objectShorthand: true,
						constBindings: true,
						preset: "es2015",
					},
					minifyInternalExports: false,
					sourcemap: false,
					dir: "./build",
					format: "esm",
				},
			},

			lib: { entry: "src/main.ts", formats: ["es"] },
			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: true,
			sourcemap: false,
			target: "esnext",
			minify: false,
		},

		esbuild: {
			minifyIdentifiers: false,
			minifyWhitespace: false,
			minifySyntax: false,
			treeShaking: true,
			logLevel: "debug",
			target: "esnext",
			sourcemap: false,
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
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
				{ find: "#src", replacement: resolve("src/") },
			],
		},
	};

	// log(config);

	return config;
});

function log(...args: unknown[]): void {
	console.dir(...args, {
		maxStringLength: 1_000,
		maxArrayLength: 100,
		compact: false,
		sorted: false,
		colors: true,
		depth: 10,
	});
}
