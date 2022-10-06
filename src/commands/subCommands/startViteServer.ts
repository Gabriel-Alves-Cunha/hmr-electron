import type { AddressInfo } from "node:net";
import type { ConfigProps } from "types/config";

import { createServer } from "vite";

import { viteBuildOptions, viteESbuildOptions } from "./runViteBuild";
import { bold, green, underline } from "@utils/cli-colors";
import { logDbg, stringifyJson } from "@utils/debug";
import { viteLoggerPlugin } from "@plugins/viteLoggerPlugin";
import { viteLog } from "@utils/consoleMsgs";

export async function startViteServer(config: ConfigProps): Promise<void> {
	const server = await (await createServer({
		build: viteBuildOptions(config, false),
		esbuild: viteESbuildOptions(),
		css: { devSourcemap: true },
		mode: "development",
		logLevel: "info",

		plugins: [
			// electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
			viteLoggerPlugin(config.srcPath),
		],

		configFile: config.viteConfigPath,
	}))
		.listen();

	logDbg("Vite server config =", stringifyJson(server.config));

	const { address, port } = server.httpServer!.address() as AddressInfo;

	viteLog(
		bold(
			green(
				`Dev server running at address ${
					underline(`http://${address}:${port}`)
				}.`,
			),
		),
	);
}
