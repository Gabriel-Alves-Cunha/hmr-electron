import type { CompileError } from "#common/compileError";
import type { ConfigProps } from "#types/config";

import { build, type BuildFailure } from "esbuild";
import { bgGreen, red, white } from "yoctocolors";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { tsconfigJson } from "#common/config";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runEsbuildForMainProcess(
	props: BuildProps,
	reportError: (errors: CompileError[]) => void,
	buildComplete: (buildOutputPath: string, count: number) => void,
): Promise<void> {
	const tsconfigPath = join(props.mainPath, tsconfigJson) ||
		props.baseTSconfigPath;
	const entryPoints = [props.entryFilePath];

	let count = 0;

	if (props.preloadFilePath) {
		entryPoints.push(props.preloadFilePath);

		console.log(
			bgGreen(white(`Using preload file: "${props.preloadFilePath}"`)),
		);
	}

	try {
		const buildResult = await build({
			...props.esbuildConfig,
			logLevel: props.esbuildConfig.logLevel || "silent",
			sourcemap: props.esbuildConfig.sourcemap || true,
			format: props.esbuildConfig.format || "esm",
			logLimit: props.esbuildConfig.logLimit || 0,
			bundle: props.esbuildConfig.bundle || true,
			external: await findExternals(props),
			incremental: !props.isBuild,
			tsconfig: tsconfigPath,
			platform: "node",
			entryPoints,
			watch: !props.isBuild ?
				{
					onRebuild: async error => {
						if (error) reportError(transformErrors(error));
						else {
							++count;
							buildComplete(props.buildOutputPath, count);
						}
					},
				} :
				false,
		});

		++count;

		console.log("Build result:", buildResult);

		buildComplete(props.buildOutputPath, count);
	} catch (error) {
		if (isBuildFailure(error))
			reportError(transformErrors(error));
		else
			console.error(error);
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

async function findExternals(props: BuildProps): Promise<string[]> {
	if (!(existsSync(props.packageJsonPath))) {
		console.error(red("Could not find a valid 'package.json'!"));
		process.exit();
	}

	const keys = ["dependencies", "devDependencies", "peerDependencies"];
	const pkg = await import(props.packageJsonPath);
	const externals = new Set<string>();

	keys.forEach(key => {
		const obj = pkg[key] ?? {};

		Object.keys(obj).forEach(name => externals.add(name));
	});

	// Find node_modules
	if (existsSync(props.nodeModulesPath)) {
		const modules = await readdir(props.nodeModulesPath);

		modules.forEach(mod => externals.add(mod));
	}

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
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type BuildProps = Readonly<
	Required<ConfigProps> & { readonly isBuild: boolean; }
>;
