import type { ConfigProps, UserProvidedConfigProps } from "#types/config";

import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

import { fileNotFound, throwPrettyError } from "./logs";
import { logDbg, stringifyJson } from "#utils/debug";

export function makeConfigProps(props: UserProvidedConfigProps): ConfigProps {
	const cwd = props.cwd || process.cwd();

	const electronEntryFilePath = resolve(props.electronEntryFilePath);

	const srcPath = props.srcPath ? resolve(props.srcPath) : join(cwd, "src");

	const mainPath = props.mainPath ?
		resolve(props.mainPath) :
		join(srcPath, "main");

	const rendererPath = props.rendererPath ?
		resolve(props.rendererPath) :
		join(srcPath, "renderer");

	const devOutputPath = props.devOutputPath ?
		resolve(props.devOutputPath) :
		join(cwd, "dev-build");

	const preloadFilePath = props.preloadFilePath ?
		resolve(props.preloadFilePath) :
		undefined;

	let preloadSourceMapFilePath: string | undefined;
	if (props.preloadFilePath) {
		preloadSourceMapFilePath = props.preloadSourceMapFilePath ?
			resolve(props.preloadSourceMapFilePath) :
			join(devOutputPath, "preload.js.map");
	}

	const rendererTSconfigPath = props.rendererTSconfigPath ?
		resolve(props.rendererTSconfigPath) :
		join(rendererPath, "tsconfig.json");

	const mainTSconfigPath = props.mainTSconfigPath ?
		resolve(props.mainTSconfigPath) :
		join(mainPath, "tsconfig.json");

	const nodeModulesPath = props.nodeModulesPath ?
		resolve(props.nodeModulesPath) :
		join(cwd, "./node_modules");

	const viteConfigPath = props.viteConfigPath ?
		resolve(props.viteConfigPath) :
		join(cwd, "vite.config.ts");

	const packageJsonPath = props.packageJsonPath ?
		resolve(props.packageJsonPath) :
		join(cwd, "package.json");

	const baseTSconfigPath = props.baseTSconfigPath ?
		resolve(props.baseTSconfigPath) :
		join(cwd, "tsconfig.json");

	const buildOutputPath = props.buildOutputPath ?
		resolve(props.buildOutputPath) :
		join(cwd, "build");

	const buildRendererOutputPath = props.buildRendererOutputPath ?
		resolve(props.buildRendererOutputPath) :
		join(buildOutputPath, "renderer");

	const hmrElectronPath = props.hmrElectronPath ?
		resolve(props.hmrElectronPath) :
		join(nodeModulesPath, "hmr-electron");

	const buildMainOutputPath = props.buildMainOutputPath ?
		resolve(props.buildMainOutputPath) :
		join(buildOutputPath, "main");

	const esbuildConfig = props.esbuildConfig || {};

	const electronOptions = Array.isArray(props.electronOptions) ?
		props.electronOptions :
		[];

	const electronBuiltEntryFile = join(devOutputPath, "main", "index.cjs");

	let electronEnviromentVariables: NodeJS.ProcessEnv = {};
	if (props.electronEnviromentVariables) {
		electronEnviromentVariables = props.electronEnviromentVariables;
	}

	const newProps: ConfigProps = {
		electronEnviromentVariables,
		preloadSourceMapFilePath,
		buildRendererOutputPath,
		electronBuiltEntryFile,
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
	// Validate if all the files exist:

	let exit = false;

	Object.entries(props).forEach(([key, filePath]) => {
		if (
			!key || !filePath /* This apparently gives: !{} => false */ || except
				.includes(key)
		)
			return;

		if (!existsSync(filePath as string)) {
			console.error(fileNotFound(key, filePath as string));
			exit = true;
		}
	});

	if (exit) {
		console.log("Resolved config props:", stringifyJson(props));
		throw throwPrettyError("Resolve the errors above and try again.");
	}

	logDbg("Resolved config props:", newProps);

	return newProps;
}

const except = [
	"preloadSourceMapFilePath",
	"buildRendererOutputPath",
	"buildMainOutputPath",
	"buildOutputPath",
	"devOutputPath",
];
