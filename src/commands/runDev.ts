import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess";
import { startViteFrontendServer } from "./startViteFrontendServer";

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
