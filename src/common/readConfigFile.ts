import type { ConfigProps } from "#types/config";

import { existsSync } from "node:fs";

import { validateConfigFile } from "#validation";

/** Loads the config from the file as a default export. */
export async function readConfigFile(filePath: string): Promise<ConfigProps> {
	if (!filePath || !existsSync(filePath))
		throw new Error(`There must be a config file! Received: '${filePath}'`);

	try {
		const config = await import(filePath);

		const isValidOrErrors = validateConfigFile(config);

		if (isValidOrErrors !== true) throw new Error(String(isValidOrErrors));

		return config as ConfigProps;
	} catch (error) {
		console.error(error);
		process.exit();
	}
}
