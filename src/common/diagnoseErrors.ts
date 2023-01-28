import { error } from "node:console";

import {
	type CompileError,
	formatCompileError,
} from "@common/formatCompileError";
import { hmrElectronConsoleMessagePrefix } from "./logs";
import { borderY, magenta } from "@utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export const diagnoseErrors = (errors: CompileError[]): void =>
	error(formatDiagnosticsMessage(errors));

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper function:

function formatDiagnosticsMessage(errors: CompileError[]): string {
	const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
	const messages = errors.map((err) => formatCompileError(err));
	const length = messages.length;

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
