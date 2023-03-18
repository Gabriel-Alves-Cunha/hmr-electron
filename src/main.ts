import { getObjectLength } from "@utils/getObjectLength.js";
import { matchAndRunArgs } from "./parseCliArgs.js";
import { printHelpMsg } from "./printHelpMsg.js";
import { argsAsObj } from "@utils/argsAsObj.js";

process.title = "hmr-electron";

const args = argsAsObj();

getObjectLength(args) === 0
	? printHelpMsg() // If only "hmr-electron" was passed:
	: await matchAndRunArgs(args);
