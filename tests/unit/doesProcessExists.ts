import { error } from "node:console";
import { kill } from "node:process";

export function doesProcessExists(pid: number | undefined): boolean {
	if (!pid) {
		error(`Invalid pid: \`${pid}\``);
		return false;
	}

	pid = Number(pid);

	try {
		kill(pid, 0); // As a special case, a signal of 0 can be used to test for the existence of a process.
		return true;
	} catch (_) {
		return false;
	}
}
