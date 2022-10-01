import type { CompileError } from "#common/compileError";
import type { ConfigProps } from "#types/config";

import { type BuildFailure, build, analyzeMetafile } from "esbuild";
import { existsSync, readdirSync } from "node:fs";
import { log, error } from "node:console";
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

		log(
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
			minify: props.isBuild ? true : false,
			outExtension: { ".js": ".cjs" },
			incremental: !props.isBuild,
			tsconfig: tsconfigPath,
			sourcesContent: false,
			treeShaking: true,
			logLevel: "debug",
			platform: "node",
			target: "esnext",
			charset: "utf8",
			sourcemap: true,
			metafile: true,
			format: "cjs",
			bundle: true,
			logLimit: 10,
			color: true,
			entryPoints,
			supported,

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

			log("Esbuild build result metafile:\n", metafile);
		}

		onBuildComplete(props, count);
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
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

const dependenciesKeys = [
	"peerDependencies",
	"devDependencies",
	"dependencies",
];

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
