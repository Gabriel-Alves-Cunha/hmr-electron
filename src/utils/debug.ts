import { log, dir } from "node:console";
import { env } from "node:process";

export const stringifyJson = (obj: unknown) => JSON.stringify(obj, null, 2);

/////////////////////////////////////////////////

const debug = env.DEBUG?.split(",");
export const doLogConfig = debug?.includes("hmr-electron:config-result");
export const doLogDebug = debug?.includes("hmr-electron");

const options = {
	maxStringLength: 1_000,
	maxArrayLength: 300,
	compact: false,
	sorted: false,
	colors: true,
	depth: 10,
};

/////////////////////////////////////////////////

export const dirDbg = (...args: unknown[]): void =>
	(doLogDebug && dir(args, options)) as void;

/////////////////////////////////////////////////

export const dbg = (...args: unknown[]): void =>
	(doLogDebug && log(...args)) as void;

/////////////////////////////////////////////////

export const logConfig = (...args: unknown[]): void =>
	(doLogConfig && dir(args, options)) as void;

/////////////////////////////////////////////////

dbg("Hello from the debug side!");
