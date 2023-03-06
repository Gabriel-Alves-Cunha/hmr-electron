import type { ConfigProps } from "types/config.js";

import { createServer } from "vite";

import { logConfig } from "@utils/debug.js";
import {
	viteESbuildOptions,
	viteBuildOptions,
} from "./runViteFrontendBuild.js";

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

	logConfig("Vite server config =", server.config);

	server.printUrls();
}
