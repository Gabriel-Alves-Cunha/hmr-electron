import type { ConfigProps, UserProvidedConfigProps } from "types/config";

import { join, resolve } from "node:path";
import { log, error } from "node:console";
import { existsSync } from "node:fs";

import { fileNotFound, throwPrettyError } from "./logs";
import { logDbg, stringifyJson } from "@utils/debug";
import { builtinModules } from "node:module";

// TODO: make use of findPathOrExit() with default places.
export function makeConfigProps(props: UserProvidedConfigProps): ConfigProps {
	const {
		electronOptions = [
			"--enable-source-maps",
			"--node-memory-debug",
			"--trace-warnings",
			"--trace-uncaught",
			"--trace-warnings",
			"--inspect",
		],
		electronEnviromentVariables = {},
		cwd = process.cwd(),
		esbuildConfig = {},
	} = props;

	///////////////////////////////////////////////

	Object.assign(electronEnviromentVariables, process.env, { FORCE_COLOR: "2" });

	///////////////////////////////////////////////

	const electronEsbuildExternalPackages =
		props.electronEsbuildExternalPackages ?
			props.electronEsbuildExternalPackages.concat(allBuiltinModules) :
			allBuiltinModules;

	///////////////////////////////////////////////

	const srcPath = props.srcPath ? resolve(props.srcPath) : join(cwd, "src");

	const mainPath = props.mainPath ?
		resolve(props.mainPath) :
		join(srcPath, main);

	const rendererPath = props.rendererPath ?
		resolve(props.rendererPath) :
		join(srcPath, "renderer");

	///////////////////////////////////////////////

	const devOutputPath = props.devOutputPath ?
		resolve(props.devOutputPath) :
		join(cwd, "dev-build");

	const devBuildMainOutputPath = props.devBuildMainOutputPath ?
		resolve(props.devBuildMainOutputPath) :
		join(devOutputPath, main);

	const devBuildRendererOutputPath = join(devOutputPath, "renderer");

	const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath ?
		resolve(props.devBuildElectronEntryFilePath) :
		join(devBuildMainOutputPath, "index.cjs");

	///////////////////////////////////////////////

	const preloadFilePath = props.preloadFilePath ?
		resolve(props.preloadFilePath) :
		undefined;

	let preloadSourceMapFilePath: string | undefined;
	if (props.preloadFilePath) {
		preloadSourceMapFilePath = props.preloadSourceMapFilePath ?
			resolve(props.preloadSourceMapFilePath) :
			join(devOutputPath, main, "preload.cjs.map");
	}

	///////////////////////////////////////////////

	const rendererTSconfigPath = props.rendererTSconfigPath ?
		resolve(props.rendererTSconfigPath) :
		join(rendererPath, tsconfigJson);

	const mainTSconfigPath = props.mainTSconfigPath ?
		resolve(props.mainTSconfigPath) :
		join(mainPath, tsconfigJson);

	const baseTSconfigPath = props.baseTSconfigPath ?
		resolve(props.baseTSconfigPath) :
		join(cwd, tsconfigJson);

	///////////////////////////////////////////////

	const nodeModulesPath = props.nodeModulesPath ?
		resolve(props.nodeModulesPath) :
		join(cwd, "./node_modules");

	const viteConfigPath = props.viteConfigPath ?
		resolve(props.viteConfigPath) :
		join(cwd, "vite.config.ts");

	const packageJsonPath = props.packageJsonPath ?
		resolve(props.packageJsonPath) :
		join(cwd, "package.json");

	///////////////////////////////////////////////

	const buildOutputPath = props.buildOutputPath ?
		resolve(props.buildOutputPath) :
		join(cwd, "build");

	const buildRendererOutputPath = props.buildRendererOutputPath ?
		resolve(props.buildRendererOutputPath) :
		join(buildOutputPath, "renderer");

	const buildMainOutputPath = props.buildMainOutputPath ?
		resolve(props.buildMainOutputPath) :
		join(buildOutputPath, main);

	///////////////////////////////////////////////

	const hmrElectronPath = props.hmrElectronPath ?
		resolve(props.hmrElectronPath) :
		join(nodeModulesPath, "hmr-electron");

	const electronEntryFilePath = resolve(props.electronEntryFilePath);

	///////////////////////////////////////////////
	///////////////////////////////////////////////

	const newProps: ConfigProps = {
		electronEsbuildExternalPackages,
		devBuildElectronEntryFilePath,
		electronEnviromentVariables,
		devBuildRendererOutputPath,
		preloadSourceMapFilePath,
		buildRendererOutputPath,
		devBuildMainOutputPath,
		electronEntryFilePath,
		rendererTSconfigPath,
		buildMainOutputPath,
		baseTSconfigPath,
		mainTSconfigPath,
		electronOptions,
		buildOutputPath,
		hmrElectronPath,
		packageJsonPath,
		nodeModulesPath,
		preloadFilePath,
		viteConfigPath,
		devOutputPath,
		esbuildConfig,
		rendererPath,
		mainPath,
		srcPath,
		cwd,
	};

	///////////////////////////////////////////////
	///////////////////////////////////////////////
	// Validate if the files exist:

	let exit = false;

	Object.entries(props).forEach(([key, filePath]) => {
		if (
			!key ||
			!filePath ||
			Array.isArray(filePath) ||
			typeof filePath === "object" ||
			except.includes(key)
		)
			return;

		if (!existsSync(filePath)) {
			error(fileNotFound(key, filePath));
			exit = true;
		}
	});

	if (exit) {
		log("Resolved config props:", stringifyJson(props));
		throwPrettyError("Resolve the errors above and try again.");
	}

	logDbg("Resolved config props:", newProps);

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
	"devOutputPath",
];

///////////////////////////////////////////

const builtinModulesWithNode = builtinModules.map(mod => `node:${mod}`);
const allBuiltinModules = builtinModulesWithNode.concat(builtinModules);

///////////////////////////////////////////////

const tsconfigJson = "tsconfig.json";
const main = "main";
