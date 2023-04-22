import type { ConfigProps } from "types/config.js";

import { type BuildOptions, context, buildSync as ESBuildSync } from "esbuild";
import { error } from "node:console";
import { exit } from "node:process";

import { ignoreDirectoriesAndFiles } from "@plugins/ignoreDirectoriesAndFiles.js";
import { hmrElectronLog } from "@common/logs.js";
import { onEnd } from "@plugins/onEnd.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runEsbuildForMainProcess(
	props: ConfigProps,
	isBuild: boolean
): Promise<void> {
	const entryPoints = [props.electronEntryFilePath];

	if (props.preloadFilePath) {
		entryPoints.push(props.preloadFilePath);

		hmrElectronLog(
			`Using preload file: "${props.preloadFilePath.substring(
				props.root.length
			)}".`
		);
	}

	try {
		const buildOptions: BuildOptions = {
			outdir: isBuild
				? props.buildMainOutputPath
				: props.devBuildMainOutputPath,
			external: props.electronEsbuildExternalPackages,
			tsconfig: props.mainTSconfigPath,
			minifyIdentifiers: isBuild,
			minifyWhitespace: isBuild,
			outExtension: { ".js": ".cjs" }, // Electron currently only accepts cjs.
			minifySyntax: isBuild,
			sourcesContent: false,
			legalComments: "none",
			sourcemap: "external",
			treeShaking: true,
			logLevel: "info",
			platform: "node",
			target: "esnext",
			minify: isBuild,
			charset: "utf8",
			metafile: false,
			format: "cjs",
			logLimit: 10,
			bundle: true,
			color: true,
			entryPoints,

			...props.esbuildConfig,
		};

		if (isBuild) {
			ESBuildSync(buildOptions);

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
