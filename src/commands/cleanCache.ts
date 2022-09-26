import type { ConfigProps } from "#types/config";

import { rm } from "node:fs/promises";

export async function cleanCache(config: ConfigProps): Promise<void> {
	await rm(config.buildOutputPath, { recursive: true, force: true });
	await rm(config.devOutputPath, { recursive: true, force: true });
}
