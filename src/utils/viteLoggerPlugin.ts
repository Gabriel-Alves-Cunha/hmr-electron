import type { Plugin } from "vite";

import { basename } from "node:path";

import { bgBlue, gray, white, yellow } from "#utils/cli-colors";

export function LoggerPlugin(srcPath: string): Plugin {
	const plugin: Plugin = {
		name: "electron-hmr-logger",
		handleHotUpdate(ctx) {
			if (!srcPath)
				throw new Error(`There must be a srcPath! Received: ${srcPath}`);

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
