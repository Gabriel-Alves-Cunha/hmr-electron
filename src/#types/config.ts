import type { BuildOptions } from "esbuild";

export type UserProvidedConfigProps = {
	preloadSourceMapFilePath?: string | undefined;
	preloadFilePath?: string | undefined;
	buildRendererOutputPath?: string;
	rendererTSconfigPath?: string;
	electronEntryFilePath: string;
	buildMainOutputPath?: string;
	esbuildConfig?: BuildOptions;
	baseTSconfigPath?: string;
	mainTSconfigPath?: string;
	nodeModulesPath?: string;
	packageJsonPath?: string;
	buildOutputPath?: string;
	hmrElectronPath?: string;
	viteConfigPath?: string;
	devOutputPath?: string;
	rendererPath?: string;
	mainPath?: string;
	srcPath?: string;
	cwd?: string;
};

export type ConfigProps = Readonly<Required<UserProvidedConfigProps>>;
