import type { BuildOptions, ESBuildOptions } from "vite";
import type { CommonOptions } from "esbuild";
import type { ConfigProps } from "types/config.js";

import { build } from "vite";

export async function runViteFrontendBuild(config: ConfigProps): Promise<void> {
	const isBuild = true;

	await build({
		esbuild: viteESbuildOptions("browser", "esm", isBuild),
		build: viteBuildOptions(config, "esm", isBuild),
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

export const viteBuildOptions = (
	config: ConfigProps,
	format: Format,
	isBuild: boolean,
): BuildOptions =>
	({
		outDir: isBuild
			? config.buildRendererOutputPath
			: config.devBuildRendererOutputPath,
		sourcemap: isBuild ? false : "inline",
		minify: isBuild ? "esbuild" : false,
		chunkSizeWarningLimit: 1_000,
		reportCompressedSize: false,
		emptyOutDir: true,
		target: "esnext",

		rollupOptions: {
			external: config.viteExternalPackages,
			preserveEntrySignatures: "strict",
			strictDeprecations: true,
			perf: true,

			output: {
				sourcemap: isBuild ? false : "inline",
				assetFileNames: "assets/[name].[ext]",
				minifyInternalExports: isBuild,
				// entryFileNames: "[name].mjs",
				chunkFileNames: "[name].mjs",
				compact: isBuild,
				format,

				generatedCode: {
					objectShorthand: true,
					constBindings: true,
					preset: "es2015",
				},
			},
		},
	}) satisfies BuildOptions;

///////////////////////////////////////////

export const viteESbuildOptions = (
	platform: NonNullable<CommonOptions["platform"]>,
	format: NonNullable<CommonOptions["format"]>,
	isBuild: boolean,
): ESBuildOptions =>
	({
		minifyIdentifiers: isBuild,
		minifyWhitespace: isBuild,
		minifySyntax: isBuild,
		sourcesContent: false,
		legalComments: "none",
		sourcemap: "external",
		treeShaking: true,
		target: "esnext",
		logLevel: "info",
		charset: "utf8",
		logLimit: 10,
		color: true,
		platform,
		format,
	}) satisfies ESBuildOptions;

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

// This is a hack I found to get the type of `format`... :|

type UnionToIntersectionHelper<U> = (
	U extends unknown
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

type UnionToIntersection<U> = boolean extends U
	? UnionToIntersectionHelper<Exclude<U, boolean>> & boolean
	: UnionToIntersectionHelper<U>;
type UnionToOvlds<U> = UnionToIntersection<
	U extends unknown ? (f: U) => void : never
>;
type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;
type OutputOptionsOrArray = NonNullable<RollupOptions["output"]>;
type RollupOptions = NonNullable<BuildOptions["rollupOptions"]>;
type OutputOptions = PopUnion<OutputOptionsOrArray>[0];
type Format = NonNullable<OutputOptions["format"]>;
