import type { Plugin } from "vite";

import { createReadStream } from "node:fs";

// serve electron preload script sourcemap
export function electronPreloadSourceMapVitePlugin(
	preloadSourceMapFilePath?: string,
): Plugin {
	const plugin: Plugin = {
		name: "electron-preload-sourcemap",

		configureServer(server) {
			if (!preloadSourceMapFilePath) return;

			server.middlewares.use((req, res, next) => {
				if (req.originalUrl && req.originalUrl === preloadSourceMapFilePath) {
					createReadStream(preloadSourceMapFilePath).pipe(res);
					return;
				}

				next();
			});
		},
	};

	return plugin;
}
