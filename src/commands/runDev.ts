import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./esbuild";
import { startViteServer } from "./subCommands/startViteServer";
import { diagnoseErrors } from "@common/diagnoseErrors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

// TODO: maybe Promise.all()?
export async function runDev(config: ConfigProps): Promise<void> {
	startViteServer(config);

	runEsbuildForMainProcess(
		{ ...config, isBuild: false },
		diagnoseErrors,
	);
}
