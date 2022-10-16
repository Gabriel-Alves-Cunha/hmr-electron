import { bgBlue, bold, black } from "./cli-colors";

export function getPrettyDate(): string {
	const date = new Date();

	return bgBlue(
		bold(
			black(
				`[${pad(date.getHours())}:${pad(date.getMinutes())}:${
					pad(date.getSeconds())
				} ${pad(date.getMilliseconds(), 3)}]`,
			),
		),
	);
}

const pad = (num: number, padding = 2): string =>
	num.toString().padStart(padding, "0");
