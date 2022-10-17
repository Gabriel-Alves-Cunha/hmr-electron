import type { BuildOptions, ESBuildOptions } from "vite";
import type { CommonOptions } from "esbuild";
import type { ConfigProps } from "types/config";

import { build as buildVite } from "vite";

import { supported } from "@commands/esbuild";

export async function runViteBuild(config: ConfigProps): Promise<void> {
	const isBuild = true;

	await buildVite({
		build: defaultViteBuildOptions(config, isBuild),
		esbuild: defaultViteESbuildOptions(),
		css: { devSourcemap: true },
		mode: "production",
		logLevel: "info",

		configFile: config.viteConfigPath,
	});
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

export const defaultViteBuildOptions = (
	config: ConfigProps,
	isBuild: boolean,
): BuildOptions => ({
	outDir: isBuild ?
		config.buildRendererOutputPath :
		config.devBuildRendererOutputPath,
	chunkSizeWarningLimit: 1_000,
	reportCompressedSize: false,
	sourcemap: "inline",
	emptyOutDir: true,
	minify: "esbuild",
	target: "esnext",

	rollupOptions: {
		external: config.electronEsbuildExternalPackages,
		preserveEntrySignatures: "strict",
		strictDeprecations: true,

		output: {
			assetFileNames: "assets/[name].[ext]",
			entryFileNames: "[name].[ext]",
			chunkFileNames: "[name].[ext]",
			minifyInternalExports: true,
			sourcemap: "inline",
			format: "esm",

			generatedCode: {
				objectShorthand: true,
				constBindings: true,
				preset: "es2015",
			},
		},
	},
});

///////////////////////////////////////////

export const defaultViteESbuildOptions = (
	platform: CommonOptions["platform"] = "browser",
): ESBuildOptions => ({
	minifyIdentifiers: false,
	minifyWhitespace: false,
	sourcesContent: false,
	sourcemap: "external",
	minifySyntax: false,
	treeShaking: true,
	target: "esnext",
	logLevel: "info",
	charset: "utf8",
	format: "esm",
	logLimit: 10,
	color: true,
	supported,
	platform,
});
