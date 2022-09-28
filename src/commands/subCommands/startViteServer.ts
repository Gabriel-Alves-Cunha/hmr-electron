import type { ConfigProps } from "#types/config";

import { createServer } from "vite";

import { electronPreloadSourceMapVitePlugin } from "#utils/electronPreloadSourceMapVitePlugin";
import { bgGreen, black, bold, green } from "#utils/cli-colors";
import { LoggerPlugin } from "#utils/viteLoggerPlugin";

export async function startViteServer(config: ConfigProps): Promise<void> {
	const server = await createServer({
		plugins: [
			electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
			LoggerPlugin(config.cwd),
		],
		configFile: config.viteConfigPath,
		logLevel: "info",
	});

	await server.listen();

	const address = server.httpServer?.address();
	if (address && typeof address === "object") {
		const { port } = address;

		console.log(
			bold(
				green(
					`${bgGreen(black("[VITE]"))} Dev server running at port ${port}.`,
				),
			),
		);
	}
}
