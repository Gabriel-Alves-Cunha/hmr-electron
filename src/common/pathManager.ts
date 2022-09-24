import { join } from "node:path";

export function pathManager(props: PathManagerProps): PathManager {
	props.cwd ||= process.cwd();
	props.srcPath ||= join(props.cwd, "src");
	props.mainPath ||= join(props.srcPath, "main");
	props.rendererPath ||= join(props.srcPath, "renderer");

	props.devOutputPath ||= join(props.cwd, "build");
	props.preloadMapFilePath ||= Boolean(props.preloadFile) ?
		join(props.devOutputPath, "preload.js.map") :
		undefined;

	props.rendererTSconfigPath ||= join(props.rendererPath, tsconfigJson);
	props.mainTSconfigPath ||= join(props.mainPath, tsconfigJson);
	props.nodeModulesPath ||= join(props.cwd, "./node_modules");
	props.viteConfigPath ||= join(props.cwd, "vite.config.ts");
	props.packageJsonPath ||= join(props.cwd, "package.json");
	props.baseTSconfigPath ||= join(props.cwd, tsconfigJson);
	props.buildOutputPath ||= join(props.cwd, "build");
	props.buildMainOutputPath ||= join(props.buildOutputPath, "main");
	props.buildRendererOutputPath ||= join(props.buildOutputPath, "renderer");

	Reflect.set(
		props,
		"hmrElectronPath",
		join(props.nodeModulesPath, "hmr-electron"),
	);

	return props as PathManager;
}

const tsconfigJson = "tsconfig.json";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
// Types:

export interface PathManagerProps {
	preloadMapFilePath?: string | undefined;
	buildRendererOutputPath?: string;
	rendererTSconfigPath?: string;
	buildMainOutputPath?: string;
	baseTSconfigPath?: string;
	mainTSconfigPath?: string;
	nodeModulesPath?: string;
	// hmrElectronPath?: string;
	packageJsonPath?: string;
	buildOutputPath?: string;
	viteConfigPath?: string;
	devOutputPath?: string;
	entryFilePath: string;
	rendererPath?: string;
	preloadFile?: string;
	mainPath?: string;
	srcPath?: string;
	cwd?: string;
}

export type PathManager = Readonly<
	Required<PathManagerProps> & { hmrElectronPath: string; }
>;
