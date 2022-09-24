import { performance } from "node:perf_hooks";

export function assertUnreachable(received: never): never {
	const error = stringifyJson(received) ?? received;

	throw new Error(
		"I shouldn't get here (on 'assertUnreachable')!\nreceived = " + error,
	);
}

/////////////////////////////////////////////////

export function time<T>(fn: () => T, label: string): T {
	const start = performance.now();

	const fnReturn = fn();

	const end = performance.now();

	dbg(
		`%cFunction %c"${label}" %ctook: ${end - start} ms.`,
		"color:brown",
		"color:blue",
		"color:brown",
	);

	return fnReturn as T;
}

/////////////////////////////////////////////////

export function stringifyJson(obj: unknown): string | undefined {
	return JSON.stringify(
		typeof obj === "function" ? obj.toString() : obj,
		null,
		2,
	);
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// @ts-ignore => This has to be by dot notation:
const logDebug = process.env.DEBUG?.includes("hmr-electron:debug") ?? false;

/////////////////////////////////////////////////

export function dbg(...args: unknown[]): void {
	if (logDebug)
		console.dir(args, {
			maxStringLength: 1_000,
			maxArrayLength: 40,
			compact: false,
			sorted: false,
			colors: true,
			depth: 10,
		});
}

dbg("Hello from the debug side!");
