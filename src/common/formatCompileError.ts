import type { Message } from "esbuild";

import { borderY, cyan, gray, red, yellow } from "@utils/cli-colors.js";
import { getPrettyDate } from "@utils/getPrettyDate.js";

const categoryMessage = red("[ERROR]");
const border = red(borderY);

export function formatCompileError(err: Message): string {
	if (!err.location) return err.text;

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
${err.text}

${code}

${border}`;
}
