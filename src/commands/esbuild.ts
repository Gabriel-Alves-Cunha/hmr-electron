import type { CompileError } from "@common/compileError";
import type { ConfigProps } from "types/config";

import { type BuildFailure, build as buildEsbuild } from "esbuild";
import { error } from "node:console";

import { stopPreviousElectronAndStartANewOne } from "@commands/subCommands/stopPreviousElectronAndStartANewOne";
import { ignoreDirectoriesAndFilesPlugin } from "@plugins/ignoreDirectoriesAndFilesPlugin";
import { getRelativeFilePath } from "@utils/getRelativeFilePath";
import { hmrElectronLog } from "@common/logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runEsbuildForMainProcess(
	props: BuildProps,
	onError: (errors: CompileError[]) => void,
): Promise<void> {
	const entryPoints = [props.electronEntryFilePath];

	if (props.preloadFilePath) {
		entryPoints.push(props.preloadFilePath);

		hmrElectronLog(
			`Using preload file: "${
				getRelativeFilePath(
					props.preloadFilePath,
					props.root,
				)
			}".`,
		);
	}

	try {
		const buildResult = await buildEsbuild({
			plugins: [
				ignoreDirectoriesAndFilesPlugin([
					/node_modules/,
				]),
			],
			outdir: props.isBuild ?
				props.buildMainOutputPath :
				props.devBuildMainOutputPath,
			external: props.electronEsbuildExternalPackages,
			tsconfig: props.mainTSconfigPath,
			outExtension: { ".js": ".cjs" },
			minify: props.isBuild,
			sourcesContent: false,
			sourcemap: "external",
			incremental: false,
			treeShaking: true,
			logLevel: "info",
			platform: "node",
			target: "esnext",
			charset: "utf8",
			metafile: true,
			format: "cjs",
			bundle: true,
			logLimit: 10,
			color: true,
			entryPoints,
			supported,

			watch: props.isBuild ? false : {
				onRebuild: async (error, result) => {
					if (error) return onError(transformErrors(error));

					if (result?.errors)
						hmrElectronLog("Esbuild build errors:\n", result.errors);

					stopPreviousElectronAndStartANewOne(props);
				},
			},

			...props.esbuildConfig,
		});

		if (buildResult.errors.length)
			hmrElectronLog("Esbuild build errors:\n", buildResult.errors);

		stopPreviousElectronAndStartANewOne(props);
	} catch (err) {
		isBuildFailure(err) ?
			onError(transformErrors(err)) :
			error(err);
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

const transformErrors = (error: BuildFailure): CompileError[] =>
	error.errors.map((e): CompileError => ({
		location: e.location,
		message: e.text,
	}));

///////////////////////////////////////////

const isBuildFailure = (err: any): err is BuildFailure =>
	err && err.errors && Array.isArray(err.errors);

///////////////////////////////////////////

export const supported = {
	"arbitrary-module-namespace-names": true,
	"regexp-sticky-and-unicode-flags": true,
	"regexp-unicode-property-escapes": true,
	"typeof-exotic-object-is-object": true,
	"class-private-static-accessor": true,
	"regexp-lookbehind-assertions": true,
	"class-private-static-method": true,
	"regexp-named-capture-groups": true,
	"class-private-static-field": true,
	"class-private-brand-check": true,
	"node-colon-prefix-require": true,
	"node-colon-prefix-import": true,
	"class-private-accessor": true,
	"optional-catch-binding": true,
	"class-private-method": true,
	"regexp-match-indices": true,
	"class-private-field": true,
	"nested-rest-binding": true,
	"class-static-blocks": true,
	"regexp-dot-all-flag": true,
	"class-static-field": true,
	"logical-assignment": true,
	"nullish-coalescing": true,
	"object-rest-spread": true,
	"exponent-operator": true,
	"import-assertions": true,
	"object-extensions": true,
	"default-argument": true,
	"object-accessors": true,
	"template-literal": true,
	"async-generator": true,
	"top-level-await": true,
	"unicode-escapes": true,
	"export-star-as": true,
	"optional-chain": true,
	"dynamic-import": true,
	"const-and-let": true,
	"rest-argument": true,
	"array-spread": true,
	destructuring: true,
	"import-meta": true,
	"async-await": true,
	"class-field": true,
	"new-target": true,
	"for-await": true,
	generator: true,
	"for-of": true,
	hashbang: true,
	bigint: true,
	class: true,
	arrow: true,
};

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type BuildProps = Readonly<ConfigProps & { isBuild: boolean; }>;
