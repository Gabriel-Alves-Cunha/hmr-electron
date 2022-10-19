import type { Plugin } from "esbuild";

import { hmrElectronLog } from "@common/logs";

// TODO: I don't even know if this is working...
export function ignoreDirectoriesAndFiles(regexOfDirs: RegExp[]): Plugin {
	const plugin: Plugin = {
		name: "ignore-directories-and-files",

		setup(build) {
			build.onResolve(
				options,
				args => ({ path: args.path, namespace }),
			);

			regexOfDirs.forEach(regex =>
				build.onResolve({ filter: regex }, args => {
					if (args.path.match(regex)) {
						hmrElectronLog(`Ignoring "${args.path}"`);
						return { path: args.path, namespace };
					} else
						return { path: args.path };
				})
			);

			build.onLoad(options, () => ({
				contents: emptyString,
			}));
		},
	};

	return plugin;
}

const regexForEverything = /.*/;
const namespace = "ignore";
const options = { filter: regexForEverything, namespace } as const;
const emptyString = "";