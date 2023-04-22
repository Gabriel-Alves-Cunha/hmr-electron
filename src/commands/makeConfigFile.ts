import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exit } from "node:process";
import { log } from "node:console";

export function makeConfigFile(): void {
	const path = resolve("hmr-electron.config.ts");

	if (existsSync(path)) {
		log(
			"There already exists a config file for hmr-electron. I'm not going to overwrite it. Exiting.",
		);
		exit(0);
	}

	try {
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
