import type { AddressInfo } from "node:net";
import type { ConfigProps } from "types/config";

import { createServer } from "vite";

import { logConfig, stringifyJson } from "@utils/debug";
import { bold, green, underline } from "@utils/cli-colors";
import { viteLoggerPlugin } from "@plugins/viteLoggerPlugin";
import { viteLog } from "@common/logs";
import {
	defaultViteESbuildOptions,
	defaultViteBuildOptions,
} from "./runViteBuild";

export async function startViteServer(config: ConfigProps): Promise<void> {
	const server = await (await createServer({
		build: defaultViteBuildOptions(config, false),
		esbuild: defaultViteESbuildOptions(),
		css: { devSourcemap: true },
		mode: "development",
		logLevel: "info",

		plugins: [
			viteLoggerPlugin(),
		],

		configFile: config.viteConfigPath,
	}))
		.listen();

	logConfig("Vite server config =", stringifyJson(server.config));

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
