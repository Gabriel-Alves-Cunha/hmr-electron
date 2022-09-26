import { createInterface } from "node:readline";
import { green } from "yoctocolors";

export function prompt(
	question: string,
): Readonly<[ReadAnswerFn, StopPromptFn]> {
	const questionAndPrompt = `${green("?")} ${question} (Y/n) `;
	const output = process.stdout;
	const input = process.stdin;

	const readline = createInterface({ input, output });

	let answerResolve: (answer: boolean) => void = () => {};
	const answerPromise = new Promise<boolean>(resolve => {
		answerResolve = resolve;
	});

	readline.question(questionAndPrompt, answer => {
		answerResolve(answer === "Y" || answer == "y");
		readline.close();
	});

	return [() => answerPromise, () => {
		console.log();
		readline.close();
	}];
}

type ReadAnswerFn = () => Promise<boolean>;
type StopPromptFn = () => void;
