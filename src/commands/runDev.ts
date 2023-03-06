import type { ConfigProps } from "types/config.js";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess.js";
import { startViteFrontendServer } from "./startViteFrontendServer.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runDev(config: ConfigProps): Promise<void> {
	await Promise.all([
		runEsbuildForMainProcess({ ...config, isBuild: false }),

		startViteFrontendServer(config),
	]);
}
