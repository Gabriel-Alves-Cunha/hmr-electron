import type { BuildOptions } from "esbuild";

// Remember to always manually update the build/index.d.ts file!!!!
export type UserProvidedConfigProps = {
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

export type ConfigProps = Readonly<
	Required<UserProvidedConfigProps & { electronBuiltEntryFile: string; }>
>;
