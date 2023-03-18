import { existsSync as e, writeFileSync as t } from "node:fs";
import { resolve as i } from "node:path";
import { exit as n } from "node:process";
import { log as c } from "node:console";
function p() {
  const r = i("hmr-electron.config.ts");
  e(r) && (c("There already exists a config file for hmr-electron."), n(0));
  try {
    t(r, l);
  } catch (o) {
    throw o;
  }
}
const l = `import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
export {
  p as makeConfigFile
};
