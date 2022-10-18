import type { BuildOptions } from "esbuild";

declare module "hmr-electron";

export declare type UserProvidedConfigProps = {
	preloadFilePath?: string | undefined;

	buildRendererOutputPath?: string;
	buildMainOutputPath?: string;
	buildOutputPath?: string;

	devBuildElectronEntryFilePath?: string;
	devBuildRendererOutputPath?: string;
	devBuildMainOutputPath?: string;
	devOutputPath?: string;

	mainTSconfigPath?: string;

	viteConfigPath?: string;

	mainPath?: string;
	srcPath?: string;

	electronEsbuildExternalPackages?: string[];
	viteExternalPackages?: string[];
	esbuildConfig?: BuildOptions;

	electronEnviromentVariables?: NodeJS.ProcessEnv;
	electronEntryFilePath: string;
	electronOptions?: string[];

	root?: string;
};
