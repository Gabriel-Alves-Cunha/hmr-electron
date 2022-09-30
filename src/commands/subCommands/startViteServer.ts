import type { ConfigProps } from "#types/config";

import { createServer } from "vite";

import { electronPreloadSourceMapVitePlugin } from "#utils/electronPreloadSourceMapVitePlugin";
import { viteConsoleMessagePrefix } from "#common/logs";
import { LoggerPlugin } from "#utils/viteLoggerPlugin";
import { bold, green } from "#utils/cli-colors";
import { logDebug } from "#utils/debug";

export async function startViteServer(config: ConfigProps): Promise<void> {
	const server = await createServer({
		esbuild: {
			logLevel: logDebug ? "debug" : "silent",
			minifyIdentifiers: false,
			minifyWhitespace: false,
			minifySyntax: false,
			treeShaking: true,
			target: "esnext",
			sourcemap: true,
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
		},

		plugins: [
			electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
			LoggerPlugin(config.cwd),
		],

		logLevel: "info",

		build: { outDir: "src/renderer" },

		configFile: config.viteConfigPath,
	});

	await server.listen();

	const address = server.httpServer?.address();
	if (address && typeof address === "object") {
		const { port } = address;

		console.log(
			bold(
				green(
					`${viteConsoleMessagePrefix} Dev server running at port ${port}.`,
				),
			),
		);
	}
}
