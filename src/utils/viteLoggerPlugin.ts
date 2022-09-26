import type { Plugin } from "vite";

import { bgBlue, gray, white, yellow } from "yoctocolors";
import { basename } from "node:path";

export function LoggerPlugin(srcPath: string): Plugin {
	const plugin: Plugin = {
		name: "electron-hmr-logger",
		handleHotUpdate(ctx) {
			if (!srcPath) {
				console.error(`There must be a srcPath! Received: ${srcPath}`);
				process.exit();
			}

			for (const { file } of ctx.modules) {
				if (!file) continue;

				const path = basename(srcPath);

				console.log(bgBlue(white("[VITE]")), yellow("hmr update"), gray(path));
			}

			return ctx.modules;
		},
	};

	return plugin;
}
