import type { ConfigProps, UserProvidedConfigProps } from "#types/config";

import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

import { fileNotFound } from "./logs";
import { dbg } from "#utils/debug";

export function makeConfigProps(props: UserProvidedConfigProps): ConfigProps {
	props.cwd ||= process.cwd();

	props.electronEntryFilePath = resolve(props.electronEntryFilePath);

	props.srcPath = props.srcPath ?
		resolve(props.srcPath) :
		join(props.cwd, "src");

	props.mainPath = props.mainPath ?
		resolve(props.mainPath) :
		join(props.srcPath, "main");

	props.rendererPath = props.rendererPath ?
		resolve(props.rendererPath) :
		join(props.srcPath, "renderer");

	props.devOutputPath = props.devOutputPath ?
		resolve(props.devOutputPath) :
		join(props.cwd, "build");

	props.preloadFilePath = props.preloadFilePath ?
		resolve(props.preloadFilePath) :
		undefined;

	if (props.preloadFilePath) {
		props.preloadSourceMapFilePath = props.preloadSourceMapFilePath ?
			resolve(props.preloadSourceMapFilePath) :
			join(props.devOutputPath, "preload.js.map");
	}

	props.rendererTSconfigPath = props.rendererTSconfigPath ?
		resolve(props.rendererTSconfigPath) :
		join(props.rendererPath, "tsconfig.json");

	props.mainTSconfigPath = props.mainTSconfigPath ?
		resolve(props.mainTSconfigPath) :
		join(props.mainPath, "tsconfig.json");

	props.nodeModulesPath = props.nodeModulesPath ?
		resolve(props.nodeModulesPath) :
		join(props.cwd, "./node_modules");

	props.viteConfigPath = props.viteConfigPath ?
		resolve(props.viteConfigPath) :
		join(props.cwd, "vite.config.ts");

	props.packageJsonPath = props.packageJsonPath ?
		resolve(props.packageJsonPath) :
		join(props.cwd, "package.json");

	props.baseTSconfigPath = props.baseTSconfigPath ?
		resolve(props.baseTSconfigPath) :
		join(props.cwd, "tsconfig.json");

	props.buildOutputPath = props.buildOutputPath ?
		resolve(props.buildOutputPath) :
		join(props.cwd, "build");

	props.buildRendererOutputPath = props.buildRendererOutputPath ?
		resolve(props.buildRendererOutputPath) :
		join(props.buildOutputPath, "renderer");

	props.hmrElectronPath = props.hmrElectronPath ?
		resolve(props.hmrElectronPath) :
		join(props.nodeModulesPath, "hmr-electron");

	props.buildMainOutputPath = props.buildMainOutputPath ?
		resolve(props.buildMainOutputPath) :
		join(props.buildOutputPath, "main");

	props.esbuildConfig ||= {};

	///////////////////////////////////////////////
	///////////////////////////////////////////////
	// Validate if all the files exist:

	let exit = false;

	Object.entries(props).forEach(([key, filePath]) => {
		if (!key || !filePath || except.includes(key)) return;

		if (!existsSync(filePath as string)) {
			console.error(fileNotFound(key, filePath as string));
			exit = true;
		}
	});

	if (exit) {
		console.log("Resolved config props:", props);
		process.exit();
	}

	dbg("Resolved config props:", props);

	return props as ConfigProps;
}

const except = [
	"preloadSourceMapFilePath",
	"buildRendererOutputPath",
	"buildMainOutputPath",
	"buildOutputPath",
	"devOutputPath",
	"esbuildConfig",
];
