import type { Plugin } from "vite";

import { error } from "node:console";

import { viteConsoleMessagePrefix } from "@common/logs";
import { getPrettyDate } from "@utils/getPrettyDate";
import { viteLog } from "@common/logs";
import { green } from "@utils/cli-colors";

export function viteLoggerPlugin(): Plugin {
	const plugin: Plugin = {
		name: "hmr-logger",

		buildEnd(err) {
			if (err) error(getPrettyDate(), viteConsoleMessagePrefix, err);

			viteLog(green("Vite build is complete."));
		},
	};

	return plugin;
}
