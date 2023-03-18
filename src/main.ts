import { exit } from "process";

import { getObjectLength } from "@utils/getObjectLength.js";
import { printHelpMsg } from "./printHelpMsg.js";
import { argsAsObj } from "@utils/argsAsObj.js";

process.title = "hmr-electron";

const args = argsAsObj();

if (getObjectLength(args) === 0) {
	// If only "hmr-electron" was passed:
	printHelpMsg();

	exit(0);
}

await (await import("./parseCliArgs.js")).matchAndRunArgs(args);
