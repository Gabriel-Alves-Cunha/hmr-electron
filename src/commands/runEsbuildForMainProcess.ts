import type { CompileError } from "@common/compileError";
import type { ConfigProps } from "types/config";

import { type BuildFailure, build as buildEsbuild } from "esbuild";
import { exit, on } from "node:process";
import { error } from "node:console";

import { stopPreviousElectronAndStartANewOne } from "@commands/subCommands/stopPreviousElectronAndStartANewOne";
import { ignoreDirectoriesAndFiles } from "@plugins/ignoreDirectoriesAndFiles";
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
				props.preloadFilePath.substring(props.root.length)
			}".`,
		);
	}

	try {
		const buildResult = await buildEsbuild({
			plugins: [
				ignoreDirectoriesAndFiles(props.esbuildIgnore),
			],
			outdir: props.isBuild ?
				props.buildMainOutputPath :
				props.devBuildMainOutputPath,
			external: props.electronEsbuildExternalPackages,
			minifyIdentifiers: props.isBuild,
			tsconfig: props.mainTSconfigPath,
			minifyWhitespace: props.isBuild,
			outExtension: { ".js": ".cjs" }, // Electron, currently, only accepts cjs!
			minifySyntax: props.isBuild,
			minify: props.isBuild,
			sourcesContent: false,
			sourcemap: "external",
			legalComments: "none",
			incremental: false,
			treeShaking: true,
			logLevel: "info",
			platform: "node",
			target: "esnext",
			charset: "utf8",
			format: "cjs",
			logLimit: 10,
			bundle: true,
			color: true,
			entryPoints,

			watch: props.isBuild ? false : {
				onRebuild(err) {
					if (err) {
						error(err);
						exit(1);
					}

					stopPreviousElectronAndStartANewOne(props);
				},
			},

			...props.esbuildConfig,
		});

		if (buildResult.errors.length)
			hmrElectronLog("Esbuild build errors:\n", buildResult.errors);

		on("exit", () => buildResult.stop?.()) // Stop esbuild watch mode

		// On watch mode, in the beginning, start Electron:
		if (!props.isBuild)
			stopPreviousElectronAndStartANewOne(props);
	} catch (err) {
		//  if (isBuildFailure(err))
		// 	onError(transformErrors(err))
		// else {
			error(err);
			exit(1);
		// }
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

const transformErrors = (err: BuildFailure): CompileError[] =>
	err.errors.map((e): CompileError => ({
		location: e.location,
		message: e.text,
	}));

///////////////////////////////////////////

const isBuildFailure = (err: any): err is BuildFailure =>
	Array.isArray(err?.errors);

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type BuildProps = Readonly<ConfigProps & { isBuild: boolean; }>;
