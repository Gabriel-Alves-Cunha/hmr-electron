import { borderY, cyan, gray, red, yellow } from "@utils/cli-colors.js";
import { getPrettyDate } from "@utils/getPrettyDate.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

const categoryMessage = red("[ERROR]");
const border = red(borderY);

export function formatCompileError(err: CompileError): string {
	if (!err.location) return err.message;

	const pathMessage = `\
file: ${cyan(`"${err.location.file}"`)}
line: ${yellow(err.location.line)}
column: ${yellow(err.location.column)}
`;

	const code = `\
${gray(`${err.location.line} |`)}  ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 4)}\
${red("~".repeat(err.location.length))}`;

	return `\
${getPrettyDate()} ${categoryMessage}
${border}
${pathMessage}
${err.message}

${code}

${border}`;
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type CompileError = Readonly<{
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
}>;
