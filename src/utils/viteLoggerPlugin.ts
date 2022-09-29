import type { Plugin } from "vite";

import { basename } from "node:path";

import { viteConsoleMessagePrefix } from "#common/logs";
import { gray, underline, yellow } from "#utils/cli-colors";

export function LoggerPlugin(srcPath: string): Plugin {
	const plugin: Plugin = {
		name: "electron-hmr-logger",
		handleHotUpdate(ctx) {
			if (!srcPath)
				throw new Error(`There must be a srcPath! Received: ${srcPath}`);

			ctx.modules.forEach(({ file }) => {
				if (!file) return;

				console.log(
					viteConsoleMessagePrefix,
					yellow("HMR update on:"),
					underline(gray(basename(srcPath))),
				);
			});

			return ctx.modules;
		},
	};

	return plugin;
}
