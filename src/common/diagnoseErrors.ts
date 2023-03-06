import { error } from "node:console";

import { hmrElectronConsoleMessagePrefix } from "./logs.js";
import { borderY, magenta } from "@utils/cli-colors.js";
import {
	type CompileError,
	formatCompileError,
} from "@common/formatCompileError.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export const displayErrors = (errors: CompileError[]): void =>
	error(formatErrorMessages(errors));

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper function:

function formatErrorMessages(errors: CompileError[]): string {
	const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
	const messages: string[] = [];
	for (const err of errors) messages.push(formatCompileError(err));
	const { length } = messages;

	let diagnosticsDetails = "";
	let index = 0;

	for (const msg of messages) {
		diagnosticsDetails += `  • ${msg}.`;

		if (index + 1 !== length) diagnosticsDetails += "\n";
	}

	return `${magentaBorder}
${hmrElectronConsoleMessagePrefix} ${magenta(
		"Some typescript compilation errors occurred:",
	)}

${diagnosticsDetails}

${magenta(errorMessage)}
${magentaBorder}`;
}

const magentaBorder = magenta(borderY);
