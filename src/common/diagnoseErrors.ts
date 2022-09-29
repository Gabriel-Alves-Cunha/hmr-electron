import { type CompileError, formatCompileError } from "#common/compileError";
import { consoleMessagePrefix } from "./logs";
import { borderY, magenta } from "#utils/cli-colors";

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
		`Found ${errors.length} errors. Watching for file changes...`;
	const messages = errors.map(e => formatCompileError(e));

	let diagnosticDetail = "";
	messages.forEach((msg, index, { length }) => {
		diagnosticDetail += msg.split("\n").map(detail => `  • ${detail}.`).join(
			"\n",
		);

		if (index + 1 !== length)
			diagnosticDetail += "\n";
	});

	const result = `\
${borderY}
${consoleMessagePrefix} ${
		magenta("Some typescript compilation errors occurred:")
	}

${diagnosticDetail}

${magenta(errorMessage)}
${borderY}`;

	return result;
}
