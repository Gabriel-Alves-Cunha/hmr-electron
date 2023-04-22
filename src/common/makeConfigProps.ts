import type { ConfigProps, UserProvidedConfigProps } from "types/config.js";

import { builtinModules } from "node:module";
import { join, resolve } from "node:path";
import { log, error } from "node:console";
import { existsSync } from "node:fs";
import { cwd, env } from "node:process";

import { logConfig, stringifyJson } from "@utils/debug.js";
import { addEnvToNodeProcessEnv } from "@utils/loadEnv.js";
import {
	defaultPathsForViteConfigFile,
	findPathOrExit,
} from "./findPathOrExit.js";
import {
	viteConfigFileNotFound,
	throwPrettyError,
	fileNotFound,
} from "@common/logs.js";

export function makeConfigProps(props: UserProvidedConfigProps): ConfigProps {
	const {
		electronOptions = defaultElectronOptions,
		electronEsbuildExternalPackages = [],
		viteExternalPackages = [],
		esbuildIgnore = [],
		esbuildConfig = {},
		root = cwd(),
	} = props;

	///////////////////////////////////////////////

	addEnvToNodeProcessEnv(join(root, ".env"));

	env["FORCE_COLOR"] = "2"; // This is for NodeJS console.

	///////////////////////////////////////////////

	electronEsbuildExternalPackages.push(
		...allBuiltinModules,
		"electron",
		"esbuild",
		"vite",
	);

	///////////////////////////////////////////////

	esbuildIgnore.push(/node_modules/);

	///////////////////////////////////////////////

	const srcPath = resolve(props.srcPath ?? "src");

	const mainPath = props.mainPath
		? resolve(props.mainPath)
		: join(srcPath, main);

	///////////////////////////////////////////////

	const hmr_electron_path = join(
		root,
		"node_modules",
		"hmr-electron",
		"user-dev-build",
	);

	const devOutputPath = resolve(props.devOutputPath ?? hmr_electron_path);

	const devBuildMainOutputPath = props.devBuildMainOutputPath
		? resolve(props.devBuildMainOutputPath)
		: join(devOutputPath, main);

	const devBuildRendererOutputPath = join(devOutputPath, renderer);

	const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath
		? resolve(props.devBuildElectronEntryFilePath)
		: join(devBuildMainOutputPath, "index.cjs");

	///////////////////////////////////////////////

	const preloadFilePath = props.preloadFilePath
		? resolve(props.preloadFilePath)
		: undefined;

	///////////////////////////////////////////////

	const mainTSconfigPath = props.mainTSconfigPath
		? resolve(props.mainTSconfigPath)
		: join(mainPath, tsconfigJson);

	///////////////////////////////////////////////

	const viteConfigPath = props.viteConfigPath
		? resolve(props.viteConfigPath)
		: findPathOrExit(defaultPathsForViteConfigFile, viteConfigFileNotFound);

	///////////////////////////////////////////////

	const buildOutputPath = resolve(props.buildOutputPath ?? "build");

	const buildRendererOutputPath = props.buildRendererOutputPath
		? resolve(props.buildRendererOutputPath)
		: join(buildOutputPath, renderer);

	const buildMainOutputPath = props.buildMainOutputPath
		? resolve(props.buildMainOutputPath)
		: join(buildOutputPath, main);

	///////////////////////////////////////////////

	const electronEntryFilePath = resolve(props.electronEntryFilePath);

	///////////////////////////////////////////////
	///////////////////////////////////////////////

	const newConfig: ConfigProps = Object.freeze({
		electronEsbuildExternalPackages,
		devBuildElectronEntryFilePath,
		devBuildRendererOutputPath,
		buildRendererOutputPath,
		devBuildMainOutputPath,
		electronEntryFilePath,
		viteExternalPackages,
		buildMainOutputPath,
		mainTSconfigPath,
		electronOptions,
		buildOutputPath,
		preloadFilePath,
		viteConfigPath,
		devOutputPath,
		esbuildConfig,
		esbuildIgnore,
		mainPath,
		srcPath,
		root,
	});

	makeSureFilesExists(newConfig);

	logConfig("Resolved config:", newConfig);

	return newConfig;
}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
// Helper functions:

function makeSureFilesExists(config: ConfigProps): void {
	let doExit = false;

	for (const [key, filePath] of Object.entries(config)) {
		if (!(key && filePath) || typeof filePath !== "string" || except.has(key))
			continue;

		if (!existsSync(filePath)) {
			error(fileNotFound(key, filePath));
			doExit = true;
		}
	}

	if (doExit) {
		log("Resolved config:", stringifyJson(config));
		throwPrettyError("Resolve the errors above and try again.");
	}
}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
// Constants:

const except = new Set([
	"devBuildElectronEntryFilePath",
	"devBuildRendererOutputPath",
	"preloadSourceMapFilePath",
	"buildRendererOutputPath",
	"devBuildMainOutputPath",
	"buildMainOutputPath",
	"buildOutputPath",
	"viteConfigPath",
	"devOutputPath",
]);

const defaultElectronOptions = [
	"--disallow-code-generation-from-strings",
	"--pending-deprecation",
	"--enable-source-maps",
	"--trace-deprecation",
	"--throw-deprecation",
	"--trace-uncaught",
	"--trace-warnings",
	"--deprecation",
	"--warnings",
	"--inspect",
];

///////////////////////////////////////////

const allBuiltinModules: string[] = [...builtinModules];

for (const module of builtinModules) allBuiltinModules.push(`node:${module}`);

///////////////////////////////////////////////

const tsconfigJson = "tsconfig.json";
const renderer = "renderer";
const main = "main";
