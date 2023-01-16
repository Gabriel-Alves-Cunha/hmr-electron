import { existsSync as t, writeFileSync as e } from "node:fs";
import { resolve as i } from "node:path";
import { t as n } from "./main-1db4fdc1.js";
import "node:process";
import "node:console";
function p() {
  const r = i("hmr-electron.config.ts");
  t(r) && n("There already exists a config file for hmr-electron.");
  try {
    e(r, c);
  } catch (o) {
    throw o;
  }
}
const c = `import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
export {
  p as makeConfigFile
};
