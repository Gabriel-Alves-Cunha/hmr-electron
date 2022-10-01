import { createInterface } from "node:readline";

import { gray, green } from "#utils/cli-colors";

export function prompt(
	question: string,
): Readonly<[ReadAnswerFn, StopPromptFn]> {
	const questionAndPrompt = `${green("?")} ${question} ${gray("(Y/n)")} `;

	const readline = createInterface({
		output: process.stdout,
		input: process.stdin,
	});

	let answerResolve: (answer: boolean) => void = () => {};
	const answerPromise = new Promise<boolean>(resolve => {
		answerResolve = resolve;
	});

	readline.question(questionAndPrompt, answer => {
		answerResolve(yes.includes(answer));
		readline.close();
	});

	return [() => answerPromise, () => {
		console.log();
		readline.close();
	}];
}

const yes = ["Y", "y", "\n", "\r", "\r\n"];

type ReadAnswerFn = () => Promise<boolean>;
type StopPromptFn = () => void;
