export function stringifyJson(obj: unknown) {
	return JSON.stringify(obj, null, 2);
}

// @ts-ignore => This has to be by dot notation:
const logDebug = process.env.DEBUG?.includes("hmr-electron") ?? false;

/////////////////////////////////////////////////

export function dbg(...args: unknown[]): void {
	if (logDebug)
		console.dir(args, {
			maxStringLength: 1_000,
			maxArrayLength: 100,
			compact: false,
			sorted: false,
			colors: true,
			depth: 10,
		});
}

dbg("Hello from the debug side!");
