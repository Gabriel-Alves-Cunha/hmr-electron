import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { throwPrettyError } from "@common/logs";

export function makeConfigFile(): void {
	const path = resolve("hmr-electron.config.ts");

	try {
		if (existsSync(path))
			throwPrettyError("There already exists a config file for hmr-electron.");

		writeFileSync(path, dataToFillFileWith);
	} catch (error) {
		throw error;
	}
}

const dataToFillFileWith = `\
import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
electronEntryFilePath: "src/main/index.ts",
preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
