import { argv } from "node:process";

import { dbg, stringifyJson } from "@utils/debug.js";

export function argsAsObj(): Record<string, string | boolean> {
	const obj: Record<string, string | boolean> = {};

	for (const arg of argv.slice(2)) {
		const [key, value] = arg.split("=");

		if (!key) continue;

		if (!value) obj[key] = true;
		else if (value === "false") obj[key] = false;
		else obj[key] = value;
	}

	dbg("argsAsObj =", stringifyJson(obj));

	return obj;
}
