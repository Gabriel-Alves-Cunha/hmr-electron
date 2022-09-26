import type { BuildOptions } from "esbuild";

export type UserProvidedConfigProps = {
	preloadSourceMapFilePath?: string | undefined;
	preloadFilePath?: string | undefined;
	buildRendererOutputPath?: string;
	rendererTSconfigPath?: string;
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
	entryFilePath: string;
	rendererPath?: string;
	mainPath?: string;
	srcPath?: string;
	cwd?: string;
};

export type ConfigProps = Readonly<Required<UserProvidedConfigProps>>;
