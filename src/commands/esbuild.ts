import type { CompileError } from "#common/compileError";
import type { ConfigProps } from "#types/config";

import { type BuildFailure, build, analyzeMetafile } from "esbuild";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { getRelativePreloadFilePath } from "#utils/getRelativeFilePath";
import { throwPrettyError } from "#common/logs";
import { cleanCache } from "./cleanCache";
import { require } from "#src/require";
import { dbg } from "#utils/debug";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runEsbuildForMainProcess(
	props: BuildProps,
	onError: (errors: CompileError[]) => void,
	onBuildComplete: (config: ConfigProps, count: number) => void,
): Promise<void> {
	const tsconfigPath = join(props.mainPath, "tsconfig.json");
	const entryPoints = [props.electronEntryFilePath];

	let count = 0;

	if (props.preloadFilePath) {
		entryPoints.push(props.preloadFilePath);

		console.log(
			`\tUsing preload file: "${
				getRelativePreloadFilePath(props.preloadFilePath, props.cwd)
			}"\n`,
		);
	}

	try {
		// Clean prev build output:
		await cleanCache(props);

		const buildResult = await build({
			outdir: props.isBuild ?
				props.buildMainOutputPath :
				join(props.devOutputPath, "main"),
			external: await findExternals(props),
			outExtension: { ".js": ".cjs" },
			incremental: !props.isBuild,
			tsconfig: tsconfigPath,
			sourcesContent: false,
			treeShaking: true,
			logLevel: "debug",
			platform: "node",
			target: "esnext",
			sourcemap: true,
			metafile: true,
			minify: false,
			format: "cjs",
			bundle: true,
			logLimit: 10,
			color: true,
			entryPoints,

			...props.esbuildConfig,

			watch: props.isBuild ? false : {
				onRebuild: async error => {
					error ?
						onError(transformErrors(error)) :
						onBuildComplete(props, count++);
				},
			},
		});

		++count;

		dbg("Build result:", buildResult);

		if (buildResult.metafile) {
			const metafile = await analyzeMetafile(buildResult.metafile, {
				verbose: true,
			});

			console.log("Esbuild build result metafile:\n", metafile);
		}

		onBuildComplete(props, count);
	} catch (error) {
		if (isBuildFailure(error))
			onError(transformErrors(error));
		else
			console.error(error);
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

async function findExternals(props: BuildProps): Promise<string[]> {
	if (!existsSync(props.packageJsonPath))
		throwPrettyError("Could not find a valid package.json");

	const packageJson = require(props.packageJsonPath);
	const externals = new Set<string>();

	dbg({ packageJson });

	dependenciesKeys.forEach(depKey => {
		const obj = packageJson[depKey] ?? {};

		Object.keys(obj).forEach(name => externals.add(name));
	});

	// Find node_modules
	if (existsSync(props.nodeModulesPath)) {
		const modules = readdirSync(props.nodeModulesPath);

		modules.forEach(mod => externals.add(mod));
	}

	dbg("Modules found to use as externals:", externals);

	return [...externals];
}

///////////////////////////////////////////

function transformErrors(error: BuildFailure): CompileError[] {
	return error.errors.map((e): CompileError => ({
		location: e.location,
		message: e.text,
	}));
}

///////////////////////////////////////////

function isBuildFailure(err: unknown): err is BuildFailure {
	// @ts-ignore => For some reason ts is not narrowing the types...
	return err && err.errors && Array.isArray(err.errors);
}

///////////////////////////////////////////

const dependenciesKeys = [
	"peerDependencies",
	"devDependencies",
	"dependencies",
];

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type BuildProps = Readonly<ConfigProps & { isBuild: boolean; }>;
