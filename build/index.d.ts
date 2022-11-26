import type { BuildOptions } from "esbuild";

export type UserProvidedConfigProps = {
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
	esbuildIgnore?: RegExp[];

	electronEntryFilePath: string;
	electronOptions?: string[];

	root?: string;
};
