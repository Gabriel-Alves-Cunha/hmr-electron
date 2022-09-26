import { cyan, gray, red, yellow } from "#utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function formatCompileError(err: CompileError): string {
	if (!err.location) return err.message;

	const categoryMessage = red("[ERROR]\n");
	const pathMessage = `\
file: ${cyan(err.location.file)}
line: ${yellow(String(err.location.line))}
column: ${yellow(String(err.location.column))}\n\n`;

	const code = `\
${gray(String(err.location.line))} ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 1 + 1)}
${red("~".repeat(err.location.length))} ${
		" ".repeat(
			err
				.location
				.lineText
				.length - err.location.column - err.location.length,
		)
	}`;

	return `${categoryMessage} - ${pathMessage} ${err.message} \n ${code}`;
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export interface CompileError {
	message: string;
	location:
		| {
			lineText: string;
			column: number;
			length: number;
			file: string;
			line: number;
		}
		| undefined
		| null;
}
