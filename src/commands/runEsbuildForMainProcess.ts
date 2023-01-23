import type { ConfigProps } from "types/config";

import { context } from "esbuild";
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
		const esbuildContext = await context({
			plugins: [
				ignoreDirectoriesAndFiles(props.esbuildIgnore),
				onEnd(props),
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
		});

		process.on("exit", () => esbuildContext.dispose().then()); // This also stops esbuild watch mode

		if (!props.isBuild) await esbuildContext.watch();
	} catch (err) {
		error(err);
		exit(1);
	}
	finally {
		console.log("esbuild finished")
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type BuildProps = Readonly<ConfigProps & { isBuild: boolean; }>;
