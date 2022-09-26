import type { ConfigProps } from "#types/config";

import { join } from "node:path";

import { dbg } from "#utils/debug";

export function makeDefaultConfigProps(
	props: ConfigProps,
): Required<ConfigProps> {
	props.cwd ||= process.cwd();
	props.srcPath ||= join(props.cwd, "src");
	props.mainPath ||= join(props.srcPath, main);
	props.rendererPath ||= join(props.srcPath, "renderer");

	props.devOutputPath ||= join(props.cwd, build);
	props.preloadMapFilePath ||= Boolean(props.preloadFilePath) ?
		join(props.devOutputPath, "preload.js.map") :
		undefined;

	props.rendererTSconfigPath ||= join(props.rendererPath, tsconfigJson);
	props.mainTSconfigPath ||= join(props.mainPath, tsconfigJson);
	props.nodeModulesPath ||= join(props.cwd, "./node_modules");
	props.viteConfigPath ||= join(props.cwd, "vite.config.ts");
	props.packageJsonPath ||= join(props.cwd, "package.json");
	props.baseTSconfigPath ||= join(props.cwd, tsconfigJson);
	props.buildOutputPath ||= join(props.cwd, build);
	props.buildMainOutputPath ||= join(props.buildOutputPath, main);
	props.buildRendererOutputPath ||= join(props.buildOutputPath, "renderer");
	props.hmrElectronPath ||= join(props.nodeModulesPath, "hmr-electron");

	props.esbuildConfig ||= {};

	dbg("Config props:", props);

	return props as Required<ConfigProps>;
}

export const tsconfigJson = "tsconfig.json";
const build = "build";
const main = "main";
