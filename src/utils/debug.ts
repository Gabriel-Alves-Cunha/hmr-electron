import { log, dir } from "node:console";
import { env } from "node:process";

export function stringifyJson(obj: unknown) {
	return JSON.stringify(obj, null, 2);
}

/////////////////////////////////////////////////

export const doLogConfig = env.DEBUG?.includes("hmr-electron:config-result") ??
	false;
export const doLogDebug = env.DEBUG?.includes("hmr-electron") ?? false;

const options = {
	maxStringLength: 1_000,
	maxArrayLength: 300,
	compact: false,
	sorted: false,
	colors: true,
	depth: 10,
};

/////////////////////////////////////////////////

export function dirDbg(...args: unknown[]): void {
	doLogDebug && dir(args, options);
}
/////////////////////////////////////////////////

export function dbg(...args: unknown[]): void {
	doLogDebug && log(...args);
}

/////////////////////////////////////////////////

export function logConfig(...args: unknown[]): void {
	doLogConfig && dir(args, options);
}

/////////////////////////////////////////////////

dbg("Hello from the debug side!");
