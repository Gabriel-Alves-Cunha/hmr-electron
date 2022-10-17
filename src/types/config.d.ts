import type { BuildOptions } from "esbuild";

// Remember to always manually update the build/index.d.ts file!!!!
export type UserProvidedConfigProps = {
	preloadFilePath?: string | undefined;

	buildRendererOutputPath?: string;
	buildMainOutputPath?: string;
	buildOutputPath?: string;

	devBuildElectronEntryFilePath?: string;
	devBuildRendererOutputPath?: string;
	devBuildMainOutputPath?: string;
	devOutputPath?: string;

	rendererTSconfigPath?: string;
	mainTSconfigPath?: string;
	baseTSconfigPath?: string;

	hmrElectronPath?: string;
	nodeModulesPath?: string;
	packageJsonPath?: string;
	viteConfigPath?: string;

	rendererPath?: string;
	mainPath?: string;
	srcPath?: string;

	electronEsbuildExternalPackages?: string[];
	esbuildConfig?: BuildOptions;

	electronEnviromentVariables?: NodeJS.ProcessEnv;
	electronEntryFilePath: string;
	electronOptions?: string[];

	root?: string;
};

export type ConfigProps = Readonly<
	Required<
		UserProvidedConfigProps
	>
>;
