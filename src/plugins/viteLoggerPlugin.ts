import type { Plugin } from "vite";

import { error, log } from "node:console";

import { green, underline, yellow } from "@utils/cli-colors";
import { getRelativeFilePath } from "@utils/getRelativeFilePath";
import { getPrettyDate } from "@utils/getPrettyDate";
import {
	hmrElectronConsoleMessagePrefix,
	viteConsoleMessagePrefix,
} from "@common/logs";
import { viteLog } from "@utils/consoleMsgs";

export function viteLoggerPlugin(srcPath: string): Plugin {
	const plugin: Plugin = {
		name: "hmr-logger",

		buildEnd(err) {
			if (err) error(getPrettyDate(), viteConsoleMessagePrefix, err);

			log(
				getPrettyDate(),
				hmrElectronConsoleMessagePrefix,
				green("Vite build is complete."),
			);
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
