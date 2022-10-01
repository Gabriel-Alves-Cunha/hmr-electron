import { log, dir } from "node:console";

export function stringifyJson(obj: unknown) {
	return JSON.stringify(obj, null, 2);
}

/////////////////////////////////////////////////

// @ts-ignore => This has to be by dot notation:
export const logDebug = process.env.DEBUG?.includes("hmr-electron") ?? false;

/////////////////////////////////////////////////

export function dbg(...args: unknown[]): void {
	if (logDebug)
		dir(args, {
			maxStringLength: 1_000,
			maxArrayLength: 100,
			compact: false,
			sorted: false,
			colors: true,
			depth: 10,
		});
}

export function logDbg(...args: unknown[]): void {
	if (logDebug) log(...args);
}

logDbg("Hello from the debug side!");
