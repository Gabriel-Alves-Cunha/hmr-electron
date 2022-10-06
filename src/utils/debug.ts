import { log, dir } from "node:console";

export function stringifyJson(obj: unknown) {
	return JSON.stringify(obj, undefined, 2);
}

/////////////////////////////////////////////////

export const logDebug = process.env.DEBUG?.includes("hmr-electron") ?? false;

/////////////////////////////////////////////////

export function dbg(...args: unknown[]): void {
	logDebug &&
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
	logDebug && log(...args);
}

logDbg("Hello from the debug side!");
