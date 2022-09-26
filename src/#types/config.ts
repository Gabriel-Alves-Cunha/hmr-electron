import type { BuildOptions } from "esbuild";

export type ConfigProps = {
	preloadMapFilePath?: string | undefined;
	buildRendererOutputPath?: string;
	rendererTSconfigPath?: string;
	buildMainOutputPath?: string;
	esbuildConfig?: BuildOptions;
	baseTSconfigPath?: string;
	mainTSconfigPath?: string;
	nodeModulesPath?: string;
	packageJsonPath?: string;
	preloadFilePath?: string;
	buildOutputPath?: string;
	hmrElectronPath?: string;
	viteConfigPath?: string;
	devOutputPath?: string;
	entryFilePath: string;
	rendererPath?: string;
	mainPath?: string;
	srcPath?: string;
	cwd?: string;
};
