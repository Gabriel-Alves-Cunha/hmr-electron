import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "./src/main/index.ts",
	preloadFilePath: "./src/main/preload.ts",
};

export default config;
