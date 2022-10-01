import type { ConfigProps } from "#types/config";

import { createServer } from "vite";

import { electronPreloadSourceMapVitePlugin } from "#utils/electronPreloadSourceMapVitePlugin";
import { viteConsoleMessagePrefix } from "#common/logs";
import { bold, green, underline } from "#utils/cli-colors";
import { getPrettyDate } from "#utils/getPrettyDate";
import { LoggerPlugin } from "#utils/viteLoggerPlugin";

export async function startViteServer(config: ConfigProps): Promise<void> {
	const server = await createServer({
		esbuild: {
			minifyIdentifiers: false,
			minifyWhitespace: false,
			sourcesContent: false,
			minifySyntax: false,
			platform: "browser",
			treeShaking: true,
			logLevel: "debug",
			target: "esnext",
			sourcemap: true,
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
		},

		plugins: [
			electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
			LoggerPlugin(config.srcPath),
		],

		logLevel: "info",

		build: { outDir: "src/renderer" },

		configFile: config.viteConfigPath,
	});

	await server.listen();

	const addressInfo = server.httpServer?.address();
	if (addressInfo && typeof addressInfo === "object") {
		const { address, port } = addressInfo;

		console.log(
			getPrettyDate(),
			viteConsoleMessagePrefix,
			bold(
				green(
					` Dev server running at address ${
						underline(`http://${address}:${port}`)
					}.`,
				),
			),
		);
	}
}
