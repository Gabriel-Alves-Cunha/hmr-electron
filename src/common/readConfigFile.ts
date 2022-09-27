import type { UserProvidedConfigProps } from "#types/config";

import { existsSync } from "node:fs";

/** Loads the config from the file as a default export. */
export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	if (!filePath || !existsSync(filePath))
		throw new Error(`There must be a config file! Received: '${filePath}'`);

	try {
		const config = await import(filePath);

		return config as UserProvidedConfigProps;
	} catch (error) {
		console.error(error);
		process.exit();
	}
}
