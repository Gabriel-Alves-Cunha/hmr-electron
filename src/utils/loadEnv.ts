import { readFileSync } from "node:fs";
import { env, exit } from "node:process";

import { hmrElectronLog } from "@common/logs.js";
import { dbg } from "@utils/debug.js";

// All of this is from the package 'dotenv' at https://github.com/motdotla/dotenv

// Populates process.env from .env file
export function addEnvToNodeProcessEnv(dotenvPath: string): void {
	try {
		// Specifying an encoding returns a string instead of a buffer.
		const parsed = parseEnvFile(
			readFileSync(dotenvPath, { encoding: "utf-8" }),
		);

		for (const key of Object.keys(parsed))
			Object.hasOwn(env, key)
				? hmrElectronLog(
						`"${key}" is already defined in \`process.env\` and was __NOT__ overwritten!`,
				  )
				: (env[key] = parsed[key]);

		dbg("Parsed enviroment variables =", env);
	} catch (error) {
		hmrElectronLog(`Failed to load ${dotenvPath} ${(error as Error).message}`);

		exit(1);
	}
}

function parseEnvFile(src: string): Record<string, string> {
	const obj: Record<string, string> = {};

	// Convert line breaks to same format:
	let match: RegExpExecArray | null | undefined;
	const lines = src.replace(/\r\n?/gm, "\n");

	while ((match = LINE.exec(lines)) !== null) {
		// rome-ignore lint/style/noNonNullAssertion: the while expression makes sure that the match is not null.
		const key = match[1]!;

		// Default undefined or null to empty string.
		// Remove whitespace.
		let value = (match[2] ?? "").trim();

		// Check if double quoted
		const maybeQuote = value[0];

		// Remove surrounding quotes:
		value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");

		// Expand newlines if double quoted:
		if (maybeQuote === '"')
			value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");

		// Add to object:
		obj[key] = value;
	}

	return obj;
}

const LINE =
	/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
