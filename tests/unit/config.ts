import type { ConfigProps } from "types/config";

import { env } from "node:process";

export const config: ConfigProps = {
	electronEsbuildExternalPackages: [],
	devBuildElectronEntryFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/main/index.cjs",
	devBuildMainOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/main/",
	electronEnviromentVariables: {
		FORCE_COLOR: "2",
		...env,
	},
	devBuildRendererOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/renderer",
	buildRendererOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build/renderer",
	electronEntryFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/index.cts",
	rendererTSconfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/renderer/tsconfig.json",
	buildMainOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build/main",
	baseTSconfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/tsconfig.json",
	mainTSconfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/tsconfig.json",
	electronOptions: [],
	buildOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build",
	hmrElectronPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/node_modules/hmr-electron",
	packageJsonPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/package.json",
	nodeModulesPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/node_modules",
	preloadFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/preload.cts",
	viteConfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/vite.config.ts",
	devOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build",
	esbuildConfig: {},
	rendererPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/renderer",
	mainPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main",
	srcPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src",
	root:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo",
};
