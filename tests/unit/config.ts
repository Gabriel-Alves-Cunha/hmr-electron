import type { ConfigProps } from "types/config";

import { env } from "node:process";

export const config: ConfigProps = {
	electronEsbuildExternalPackages: [],
	electronOptions: [],
	esbuildConfig: {},
	electronEnviromentVariables: {
		FORCE_COLOR: "2",
		...env,
	},
	devBuildElectronEntryFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/main/index.cjs",
	devBuildMainOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/main/",
	devBuildRendererOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build/renderer",
	buildRendererOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build/renderer",
	electronEntryFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/index.cts",
	buildMainOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build/main",
	mainTSconfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/tsconfig.json",
	buildOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/build",
	preloadFilePath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main/preload.cts",
	viteConfigPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/vite.config.ts",
	devOutputPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/dev-build",
	mainPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src/main",
	srcPath:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo/src",
	root:
		"/home/gabriel/Documents/VSCode/my_projects/hmr-electron/tests/full/demo",
};
