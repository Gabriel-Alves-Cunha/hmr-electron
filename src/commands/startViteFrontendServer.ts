import type { ConfigProps } from "types/config";

import { createServer } from "vite";

import { viteESbuildOptions, viteBuildOptions } from "./runViteFrontendBuild";
import { logConfig, stringifyJson } from "@utils/debug";

export async function startViteFrontendServer(
	config: ConfigProps,
): Promise<void> {
	const isBuild = false;

	const server = await (
		await createServer({
			esbuild: viteESbuildOptions("browser", "esm", isBuild),
			build: viteBuildOptions(config, "esm", isBuild),
			css: { devSourcemap: true },
			mode: "development",
			logLevel: "info",

			configFile: config.viteConfigPath,
		})
	).listen();

	logConfig("Vite server config =", stringifyJson(server.config));

	server.printUrls();
}
