import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function makeConfigFile(): void {
	const dataToFillFileWith = `\
import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;

	try {
		writeFileSync(resolve("hmr-electron.config.ts"), dataToFillFileWith);
	} catch (error) {
		throw error;
	}
}
