import type { Plugin } from "vite";

import { error } from "node:console";

import { viteConsoleMessagePrefix } from "@common/logs";
import { green, underline, yellow } from "@utils/cli-colors";
import { getRelativeFilePath } from "@utils/getRelativeFilePath";
import { getPrettyDate } from "@utils/getPrettyDate";
import { viteLog } from "@common/logs";

export function viteLoggerPlugin(srcPath: string): Plugin {
	const plugin: Plugin = {
		name: "hmr-logger",

		buildEnd(err) {
			if (err) error(getPrettyDate(), viteConsoleMessagePrefix, err);

			viteLog(green("Vite build is complete."));
		},

		handleHotUpdate(ctx) {
			ctx.modules.forEach(({ file }) => {
				if (!file) return;

				const path = getRelativeFilePath(file, srcPath);

				viteLog(
					yellow(`HMR update on: ${underline(path)}`),
				);
			});

			return ctx.modules;
		},
	};

	return plugin;
}
