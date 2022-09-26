import type { ConfigProps, UserProvidedConfigProps } from "#types/config";

import { existsSync } from "node:fs";
import { join } from "node:path";

import { fileNotFound } from "./logs";
import { dbg } from "#utils/debug";

export function makeDefaultConfigPropsWhereNeeded(
	props: UserProvidedConfigProps,
): ConfigProps {
	props.cwd ||= process.cwd();
	props.srcPath ||= join(props.cwd, "src");
	props.mainPath ||= join(props.srcPath, main);
	props.rendererPath ||= join(props.srcPath, "renderer");

	props.devOutputPath ||= join(props.cwd, build);
	props.preloadFilePath ||= undefined;

	props.preloadSourceMapFilePath ||= props.preloadFilePath ?
		join(props.devOutputPath, "preload.js.map") :
		undefined;

	props.rendererTSconfigPath ||= join(props.rendererPath, tsconfigJson);
	props.mainTSconfigPath ||= join(props.mainPath, tsconfigJson);
	props.nodeModulesPath ||= join(props.cwd, "./node_modules");
	props.viteConfigPath ||= join(props.cwd, "vite.config.ts");
	props.packageJsonPath ||= join(props.cwd, "package.json");
	props.baseTSconfigPath ||= join(props.cwd, tsconfigJson);
	props.buildOutputPath ||= join(props.cwd, build);

	props.buildRendererOutputPath ||= join(props.buildOutputPath, "renderer");
	props.hmrElectronPath ||= join(props.nodeModulesPath, "hmr-electron");
	props.buildMainOutputPath ||= join(props.buildOutputPath, main);

	props.esbuildConfig ||= {};

	///////////////////////////////////////////////
	///////////////////////////////////////////////
	// Validate if all the files exist:

	{
		let exit = false;

		Object.entries(props).forEach(([filePathKey, filePath]) => {
			if (!filePathKey || !filePath || typeof filePathKey === "object") return;

			if (!existsSync(filePath as string)) {
				console.error(fileNotFound(filePathKey, filePath as string));
				exit = true;
			}
		});

		if (exit) {
			console.log("Resolved config props:", props);
			process.exit();
		}
	}

	dbg("Resolved config props:", props);

	return props as ConfigProps;
}

export const tsconfigJson = "tsconfig.json";
const build = "build";
const main = "main";
