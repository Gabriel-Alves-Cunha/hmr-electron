import type { Message } from "esbuild";

import { error } from "node:console";

import { hmrElectronConsoleMessagePrefix } from "./logs.js";
import { formatCompileError } from "@common/formatCompileError.js";
import { borderX, magenta } from "@utils/cli-colors.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export const displayErrors = (errors: Message[]): void =>
	error(formatErrorMessages(errors));

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper function:

function formatErrorMessages(errors: Message[]): string {
	const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
	const messages: string[] = [];
	for (const err of errors) messages.push(formatCompileError(err));
	const { length } = messages;

	let diagnosticsDetails = "";
	let index = 0;

	for (const msg of messages) {
		diagnosticsDetails += `  • ${msg}.${index + 1 !== length ? "\n" : ""}`;

		++index;
	}

	return `${magentaBorder}
${hmrElectronConsoleMessagePrefix} ${magenta(
		"Some TypeScript compilation errors occurred:",
	)}

${diagnosticsDetails}

${magenta(errorMessage)}
${magentaBorder}`;
}

const magentaBorder = magenta(borderX);
