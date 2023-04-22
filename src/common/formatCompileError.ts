import type { Message } from "esbuild";

import { borderX, cyan, gray, red, yellow } from "@utils/cli-colors.js";
import { getPrettyDate } from "@utils/getPrettyDate.js";

const categoryMessage = red("[ERROR]");
const border = red(borderX);

export function formatCompileError(err: Message): string {
	if (!err.location) return err.text;

	return `\
${getPrettyDate()} ${categoryMessage}
${border}
file: ${cyan(`"${err.location.file}"`)}
line: ${yellow(err.location.line)}
column: ${yellow(err.location.column)}
${err.text}

${gray(`${err.location.line} |`)}  ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 4)}\
${red("~".repeat(err.location.length))}

${border}`;
}
