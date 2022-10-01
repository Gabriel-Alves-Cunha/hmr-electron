import type { Plugin } from "vite";

import { createReadStream } from "node:fs";

import { yellow } from "./cli-colors";

// Serve electron preload script sourcemap.
export function electronPreloadSourceMapVitePlugin(
	preloadSourceMapFilePath: string | undefined,
): Plugin {
	const plugin: Plugin = {
		name: "electron-preload-sourcemap",

		configureServer(server) {
			if (!preloadSourceMapFilePath)
				return console.warn(yellow("No preloadSourceMapFilePath."));
			else console.log("preloadSourceMapFilePath =", preloadSourceMapFilePath);

			server.middlewares.use((req, res, next) => {
				if (
					req.originalUrl && preloadSourceMapFilePath.includes(req.originalUrl)
				) {
					console.log("Using preload map...");
					createReadStream(preloadSourceMapFilePath).pipe(res);

					return next();
				}
				console.log("Not using preload map.", req.originalUrl);

				next();
			});
		},
	};

	return plugin;
}
