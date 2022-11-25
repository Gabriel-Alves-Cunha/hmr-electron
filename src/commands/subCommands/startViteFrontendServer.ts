import type { AddressInfo } from "node:net";
import type { ConfigProps } from "types/config";

import { createServer } from "vite";

import { viteESbuildOptions, viteBuildOptions } from "./runViteFrontendBuild";
import { logConfig, stringifyJson } from "@utils/debug";
import { bold, green, underline } from "@utils/cli-colors";
import { viteLog } from "@common/logs";

export async function startViteFrontendServer(
	config: ConfigProps,
): Promise<void> {
	const isBuild = false;

	const server = await (
		await createServer({
			esbuild: viteESbuildOptions("browser", "esm", isBuild),
			build: viteBuildOptions(config, "esm", isBuild),
			css: { devSourcemap: true },
			mode: "development",
			logLevel: "info",

			configFile: config.viteConfigPath,
		})
	).listen();

	logConfig("Vite server config =", stringifyJson(server.config));

	///////////////////////////////////////////
	///////////////////////////////////////////

	const { address, port } = server.httpServer!.address() as AddressInfo;

	viteLog(
		bold(
			green(
				`Dev server running at address ${underline(
					`http://${address}:${port}`,
				)}.`,
			),
		),
	);
}
