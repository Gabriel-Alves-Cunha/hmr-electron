import type { Plugin } from "vite";

import { createReadStream } from "node:fs";
import { log, warn } from "node:console";

import { yellow } from "@utils/cli-colors";

// I can't get this to work...
// Serve electron preload script sourcemap.
export function electronPreloadSourceMapVitePlugin(
	preloadSourceMapFilePath: string | undefined,
): Plugin {
	const plugin: Plugin = {
		name: "hmr-electron-preload-sourcemap",

		configureServer(server) {
			if (!preloadSourceMapFilePath)
				return warn(yellow("No preloadSourceMapFilePath."));
			else log("preloadSourceMapFilePath =", preloadSourceMapFilePath);

			server.middlewares.use((req, res, next) => {
				if (
					req.originalUrl && preloadSourceMapFilePath.includes(req.originalUrl)
				) {
					log("Using preload map...");
					createReadStream(preloadSourceMapFilePath).pipe(res);
					return;
				} else log("Not using preload map.", req.originalUrl);

				return next();
			});
		},
	};

	return plugin;
}
