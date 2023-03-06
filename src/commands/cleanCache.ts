import type { ConfigProps } from "types/config.js";

import { rmSync } from "node:fs";

export function cleanCache(config: ConfigProps): void {
	rmSync(config.buildOutputPath, options);
	rmSync(config.devOutputPath, options);
}

const options = { recursive: true, force: true };
