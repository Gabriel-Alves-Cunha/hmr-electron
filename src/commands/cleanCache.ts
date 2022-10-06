import type { ConfigProps } from "types/config";

import { rm } from "node:fs/promises";

export async function cleanCache(config: ConfigProps): Promise<void> {
	await Promise.all([
		rm(config.buildOutputPath, options),
		rm(config.devOutputPath, options),
	]);
}

const options = { recursive: true, force: true };
