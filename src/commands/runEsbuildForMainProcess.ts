import type { ConfigProps } from "types/config";

import { type BuildOptions, context, buildSync } from "esbuild";
import { error } from "node:console";
import { exit } from "node:process";

import { ignoreDirectoriesAndFiles } from "@plugins/ignoreDirectoriesAndFiles";
import { hmrElectronLog } from "@common/logs";
import { onEnd } from "@plugins/onEnd";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runEsbuildForMainProcess(
	props: BuildProps,
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
		const buildOptions: BuildOptions = {
			outdir: props.isBuild ?
				props.buildMainOutputPath :
				props.devBuildMainOutputPath,
			external: props.electronEsbuildExternalPackages,
			minifyIdentifiers: props.isBuild,
			tsconfig: props.mainTSconfigPath,
			minifyWhitespace: props.isBuild,
			outExtension: { ".js": ".cjs" }, // Electron currently only accepts cjs.
			minifySyntax: props.isBuild,
			minify: props.isBuild,
			sourcesContent: false,
			legalComments: "none",
			sourcemap: "external",
			treeShaking: true,
			logLevel: "info",
			platform: "node",
			target: "esnext",
			charset: "utf8",
			metafile: false,
			format: "cjs",
			logLimit: 10,
			bundle: true,
			color: true,
			entryPoints,

			...props.esbuildConfig,
		}

		if (props.isBuild) {
			buildSync(buildOptions);

			return;
		}

		buildOptions.plugins = [
			ignoreDirectoriesAndFiles(props.esbuildIgnore),
			onEnd(props), // On end, restart electron.
		];

		const esbuildContext = await context(buildOptions);

		// We have to clean esbuild as it is another independent software:
		process.on("exit", () => esbuildContext.dispose().then());

		await esbuildContext.watch();
	} catch (err) {
		error(err);
		exit(1);
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type BuildProps = Readonly<ConfigProps & { isBuild: boolean; }>;
