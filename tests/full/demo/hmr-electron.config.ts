import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "./src/main/index.cts",
	preloadFilePath: "./src/main/preload.cts",
};

export default config;
