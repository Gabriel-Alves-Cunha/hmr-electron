import type { BuildOptions } from "esbuild";

declare module "hmr-electron";

export declare type UserProvidedConfigProps = {
	preloadSourceMapFilePath?: string | undefined;
	preloadFilePath?: string | undefined;

	buildRendererOutputPath?: string;
	buildMainOutputPath?: string;
	buildOutputPath?: string;

	devOutputPath?: string;

	rendererTSconfigPath?: string;

	electronEntryFilePath: string;
	hmrElectronPath?: string;

	baseTSconfigPath?: string;
	mainTSconfigPath?: string;
	nodeModulesPath?: string;
	packageJsonPath?: string;
	viteConfigPath?: string;

	rendererPath?: string;
	mainPath?: string;
	srcPath?: string;

	esbuildConfig?: BuildOptions;
	electronOptions?: string[];

	electronEnviromentVariables?: NodeJS.ProcessEnv;
	cwd?: string;
};
