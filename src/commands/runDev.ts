import type { ConfigProps } from "#types/config";

import { entryFilePathNotFound, viteConfigFileNotFound } from "#common/logs";
import { runEsbuildForMainProcess } from "./esbuild";
import { promptToRerunElectron } from "./runBuild";
import { startViteServer } from "./subCommands/startViteServer";
import { diagnoseErrors } from "#common/diagnoseErrors";
import {
	defaultPathsForViteConfigFile,
	entryFileDefaultPlaces,
	findPathOrExit,
} from "#common/findPathOrExit";

export async function runDev(config: ConfigProps) {
	// Start Vite server:
	findPathOrExit(
		[config.viteConfigPath, ...defaultPathsForViteConfigFile],
		viteConfigFileNotFound(config.cwd),
	);

	await startViteServer(config);

	// Start dev for main process.
	findPathOrExit(
		[config.electronEntryFilePath, ...entryFileDefaultPlaces],
		entryFilePathNotFound(config.electronEntryFilePath),
	);

	await runEsbuildForMainProcess(
		{ ...config, isBuild: false },
		diagnoseErrors,
		promptToRerunElectron,
	);
}
