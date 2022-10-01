import type { ConfigProps } from "#types/config";

import { build } from "vite";

import { supported } from "#commands/esbuild";
import { dbg } from "#utils/debug";

export async function runViteBuild(config: ConfigProps): Promise<void> {
	const buildResult = await build({
		esbuild: {
			minifyIdentifiers: false,
			minifyWhitespace: false,
			sourcesContent: false,
			minifySyntax: false,
			platform: "browser",
			treeShaking: true,
			logLevel: "debug",
			target: "esnext",
			sourcemap: true,
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
			supported,
		},

		logLevel: "info",

		build: {
			outDir: config.buildRendererOutputPath,
			rollupOptions: {
				preserveEntrySignatures: "strict",
				strictDeprecations: true,

				output: {
					generatedCode: {
						objectShorthand: true,
						constBindings: true,
						preset: "es2015",
					},

					format: "esm",
				},
			},

			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: true,
			sourcemap: false,
			target: "esnext",
			minify: true,
		},

		configFile: config.viteConfigPath,
	});

	dbg({ buildResult });
}
