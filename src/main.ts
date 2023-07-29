import { getObjectLength } from "@utils/getObjectLength.js";
import { argsAsObj } from "@utils/argsAsObj.js";

process.title = "hmr-electron";

const args = argsAsObj();

// Wrapping in a setTimeout because Node shuts down before it finishes promises otherwise.
setTimeout(async () => {
	getObjectLength(args) === 0
		? // If only "hmr-electron" was passed, print help message:
		  (await import("./utils/printHelpMsg.js")).printHelpMsg()
		: await (await import("./parseCliArgs.js")).matchAndRunArgs(args);
});
