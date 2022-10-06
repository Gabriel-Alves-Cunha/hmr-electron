import { createInterface } from "node:readline";

import { getPrettyDate } from "@utils/getPrettyDate";
import { gray } from "@utils/cli-colors";

export async function askYesNo(
	{ question, yesValues, noValues }: AskYesNoProps,
): Promise<readonly [ReadAnswerFn, StopPromptFn]> {
	question = `${getPrettyDate()} ${question} ${gray("(Y/n)")} `;
	yesValues = yesValues?.map(v => v.toLowerCase()) ?? yes;
	noValues = noValues?.map(v => v.toLowerCase()) ?? no;

	const readline = createInterface({
		output: process.stdout,
		input: process.stdin,
	});

	const stopPromptFn: StopPromptFn = () => readline.close();

	const readAnswerFn = () =>
		new Promise<boolean>(resolve => {
			readline.question(question, async answer => {
				readline.close();

				const cleaned = answer.trim().toLowerCase();

				if (cleaned === "")
					return resolve(true);

				if (yesValues.includes(cleaned))
					return resolve(true);

				if (noValues.includes(cleaned))
					return resolve(false);
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

type AskYesNoProps = Handler & {
	onInvalidAnswer?: (props: Required<Handler>) => void;
};
