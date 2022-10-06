import { log } from "node:console";

import { getPrettyDate } from "./getPrettyDate";
import {
	hmrElectronConsoleMessagePrefix,
	viteConsoleMessagePrefix,
} from "@common/logs";

export function hmrElectronLog(...args: unknown[]): void {
	log(
		getPrettyDate(),
		hmrElectronConsoleMessagePrefix,
		...args,
	);
}

export function viteLog(...args: unknown[]): void {
	log(
		getPrettyDate(),
		viteConsoleMessagePrefix,
		...args,
	);
}
