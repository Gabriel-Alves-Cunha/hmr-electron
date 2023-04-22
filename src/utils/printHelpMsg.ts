import { log } from "node:console";

import { blue, bold, borderX, green, yellow } from "@utils/cli-colors.js";
import { name, version } from "../../package.json";

export function printHelpMsg() {
	log(`${borderX}
${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage:")} ${name} [command] [options]

  You must have a config file ('${blue("hmr-electron.config.ts")}')
  file at the root of your package.

${bold("Commands and options:")}
  init  ${blue("Make a config file")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]`);
}

const greenEqual = green("=");
