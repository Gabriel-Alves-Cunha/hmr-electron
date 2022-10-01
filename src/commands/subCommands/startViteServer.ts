import type { ConfigProps } from "#types/config";

import { createServer } from "vite";
import { log } from "node:console";

import { electronPreloadSourceMapVitePlugin } from "#utils/electronPreloadSourceMapVitePlugin";
import { viteConsoleMessagePrefix } from "#common/logs";
import { bold, green, underline } from "#utils/cli-colors";
import { logDbg, stringifyJson } from "#utils/debug";
import { getPrettyDate } from "#utils/getPrettyDate";
import { LoggerPlugin } from "#utils/viteLoggerPlugin";
import { supported } from "#commands/esbuild";

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
			supported,
		},

		plugins: [
			electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
			LoggerPlugin(config.srcPath),
		],

		logLevel: "info",

		build: {
			outDir: config.devBuildRendererOutputPath,
			rollupOptions: {
				output: {
					generatedCode: {
						objectShorthand: true,
						constBindings: true,
						preset: "es2015",
					},
				},
			},
		},

		configFile: config.viteConfigPath,
	});

	logDbg("Vite server moduleGraph =", stringifyJson(server.moduleGraph));
	logDbg("Vite server config =", stringifyJson(server.config));

	await server.listen();

	const addressInfo = server.httpServer?.address();
	if (addressInfo && typeof addressInfo === "object") {
		const { address, port } = addressInfo;

		log(
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
