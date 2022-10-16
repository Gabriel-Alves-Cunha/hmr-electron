import { stdin, stdout } from "node:process";

import { getPrettyDate } from "@utils/getPrettyDate";
import { gray } from "@utils/cli-colors";

export async function askYesNo(
	{ question, yesValues, noValues }: AskYesNoProps,
): Promise<readonly [ReadAnswerFn, StopPromptFn]> {
	question = `${getPrettyDate()} ${question} ${gray("(Y/n)")} `;
	yesValues = yesValues?.map(v => v.toLowerCase()) ?? yes;
	noValues = noValues?.map(v => v.toLowerCase()) ?? no;

	const stopPromptFn: StopPromptFn = () => stdin.end();

	stdout.write(question);

	const readAnswerFn = () =>
		new Promise<boolean>(resolve => {
			stdin.on("data", data => {
				const cleaned = data.toString().trim().toLowerCase();

				if (cleaned === "" || (yesValues as string[]).includes(cleaned)) {
					stdin.end();
					return resolve(true);
				}

				if ((noValues as string[]).includes(cleaned)) {
					stdin.end();
					return resolve(false);
				}

				stdout.write(question);
			});
		});

	return [readAnswerFn, stopPromptFn];
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

const yes = ["yes", "y"];
const no = ["no", "n"];

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type Handler = {
	yesValues?: string[];
	noValues?: string[];
	question: string;
};

///////////////////////////////////////////

type ReadAnswerFn = () => Promise<boolean>;
export type StopPromptFn = () => void;

///////////////////////////////////////////

interface AskYesNoProps extends Handler {
	onInvalidAnswer?: (props: Required<Handler>) => void;
}
