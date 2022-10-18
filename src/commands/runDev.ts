import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess";
import { startViteFrontendServer } from "./subCommands/startViteFrontendServer";
import { diagnoseErrors } from "@common/diagnoseErrors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runDev(config: ConfigProps): Promise<void> {
	await Promise.all([
		runEsbuildForMainProcess(
			{ ...config, isBuild: false },
			diagnoseErrors,
		),

		startViteFrontendServer(config),
	]);
}
