import type { ConfigProps, UserProvidedConfigProps } from "types/config";

import { builtinModules } from "node:module";
import { join, resolve } from "node:path";
import { log, error } from "node:console";
import { existsSync } from "node:fs";
import { cwd, env } from "node:process";

import { logConfig, stringifyJson } from "@utils/debug";
import {
	defaultPathsForViteConfigFile,
	findPathOrExit,
} from "./findPathOrExit";
import {
	viteConfigFileNotFound,
	throwPrettyError,
	fileNotFound,
} from "@common/logs";

export function makeConfigProps(props: UserProvidedConfigProps): ConfigProps {
	const {
		electronOptions = [
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
		],
		electronEnviromentVariables = {},
		esbuildConfig = {},
		root = cwd(),
	} = props;

	///////////////////////////////////////////////

	Object.assign(electronEnviromentVariables, env, { FORCE_COLOR: "2" });

	///////////////////////////////////////////////

	const electronEsbuildExternalPackages =
		(props.electronEsbuildExternalPackages ?? []).concat(
			allBuiltinModules,
			"electron",
			"esbuild",
			"vite",
		);

	const viteExternalPackages = props.viteExternalPackages ?? [];

	///////////////////////////////////////////////

	const srcPath = resolve(props.srcPath ?? "src");

	const mainPath = props.mainPath ?
		resolve(props.mainPath) :
		join(srcPath, main);

	///////////////////////////////////////////////

	const devOutputPath = resolve(props.devOutputPath ?? "dev-build");

	const devBuildMainOutputPath = props.devBuildMainOutputPath ?
		resolve(props.devBuildMainOutputPath) :
		join(devOutputPath, main);

	const devBuildRendererOutputPath = join(devOutputPath, renderer);

	const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath ?
		resolve(props.devBuildElectronEntryFilePath) :
		join(devBuildMainOutputPath, "index.cjs");

	///////////////////////////////////////////////

	const preloadFilePath = props.preloadFilePath ?
		resolve(props.preloadFilePath) :
		undefined;

	///////////////////////////////////////////////

	const mainTSconfigPath = props.mainTSconfigPath ?
		resolve(props.mainTSconfigPath) :
		join(mainPath, tsconfigJson);

	///////////////////////////////////////////////

	const viteConfigPath = props.viteConfigPath ?
		resolve(props.viteConfigPath) :
		findPathOrExit(defaultPathsForViteConfigFile, viteConfigFileNotFound);

	///////////////////////////////////////////////

	const buildOutputPath = resolve(props.buildOutputPath ?? "build");

	const buildRendererOutputPath = props.buildRendererOutputPath ?
		resolve(props.buildRendererOutputPath) :
		join(buildOutputPath, renderer);

	const buildMainOutputPath = props.buildMainOutputPath ?
		resolve(props.buildMainOutputPath) :
		join(buildOutputPath, main);

	///////////////////////////////////////////////

	const electronEntryFilePath = resolve(props.electronEntryFilePath);

	///////////////////////////////////////////////
	///////////////////////////////////////////////

	const newProps: ConfigProps = {
		electronEsbuildExternalPackages,
		devBuildElectronEntryFilePath,
		electronEnviromentVariables,
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
		mainPath,
		srcPath,
		root,
	};

	///////////////////////////////////////////////
	///////////////////////////////////////////////
	// Validate if the files exist:

	let doExit = false;

	Object.entries(props).forEach(([key, filePath]) => {
		if (
			!key ||
			!filePath ||
			typeof filePath !== "string" ||
			except.includes(key)
		)
			return;

		if (!existsSync(filePath)) {
			error(fileNotFound(key, filePath));
			doExit = true;
		}
	});

	if (doExit) {
		log("Resolved config props:", stringifyJson(props));
		throwPrettyError("Resolve the errors above and try again.");
	}

	logConfig("Resolved config props:", newProps);

	return newProps;
}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
// Constants:

const except = [
	"preloadSourceMapFilePath",
	"buildRendererOutputPath",
	"buildMainOutputPath",
	"buildOutputPath",
	"viteConfigPath",
	"devOutputPath",
];

///////////////////////////////////////////

const builtinModulesWithNode = builtinModules.map(mod => `node:${mod}`);
const allBuiltinModules = builtinModulesWithNode.concat(builtinModules);

///////////////////////////////////////////////

const tsconfigJson = "tsconfig.json";
const renderer = "renderer";
const main = "main";
