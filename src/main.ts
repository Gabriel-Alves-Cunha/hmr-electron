import { getObjectLength } from "@utils/getObjectLength.js";
import { printHelpMsg } from "./printHelpMsg.js";
import { argsAsObj } from "@utils/argsAsObj.js";

process.title = "hmr-electron";

const args = argsAsObj();

setTimeout(async () => {
	getObjectLength(args) === 0
		? printHelpMsg() // If only "hmr-electron" was passed:
		: await (await import("./parseCliArgs.js")).matchAndRunArgs(args);
});
