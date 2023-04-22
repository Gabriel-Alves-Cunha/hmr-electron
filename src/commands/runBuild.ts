import type { ConfigProps } from "types/config.js";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess.js";
import { runViteFrontendBuild } from "./runViteFrontendBuild.js";
import { isBuild } from "@utils/utils.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	await Promise.all([
		runEsbuildForMainProcess(config, isBuild),

		runViteFrontendBuild(config),
	]);
}
