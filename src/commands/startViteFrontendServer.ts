import type { ConfigProps } from "types/config.js";

import { createServer as createViteServer } from "vite";

import { isBuild, css } from "@utils/utils.js";
import { logConfig } from "@utils/debug.js";
import {
	viteESbuildOptions,
	viteBuildOptions,
} from "./runViteFrontendBuild.js";

export async function startViteFrontendServer(
	config: ConfigProps
): Promise<void> {
	const server = await (
		await createViteServer({
			esbuild: viteESbuildOptions("browser", "esm", !isBuild),
			build: viteBuildOptions(config, "esm", !isBuild),
			mode: "development",
			logLevel: "info",
			css,

			configFile: config.viteConfigPath,
		})
	).listen();

	logConfig("Vite server config =", server.config);

	server.printUrls();
}
