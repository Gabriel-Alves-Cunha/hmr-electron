import { magenta } from "yoctocolors";

import { type CompileError, formatCompileError } from "#common/compileError";
import { consoleMessagePrefix } from "./logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function diagnoseErrors(errors: CompileError[]): void {
	const output = formatDiagnosticsMessage(errors);

	console.error(output);
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper function:

function formatDiagnosticsMessage(errors: CompileError[]): string {
	const errorMessage =
		`Found ${errors.length} errors. Watching for file changes.`;
	const messages = errors.map(e => formatCompileError(e));

	let diagnosticDetail = "";
	messages.forEach((msg, index, { length }) => {
		diagnosticDetail += msg.split(newLine).map(i => "  " + i).join(newLine);

		if (index + 1 !== length)
			diagnosticDetail += newLine;
	});

	const result = `\
${
		magenta(
			`${consoleMessagePrefix} Some typescript compilation errors occurred:`,
		)
	}
${diagnosticDetail}
${magenta(errorMessage)}`;

	return result;
}

const newLine = "\n";
