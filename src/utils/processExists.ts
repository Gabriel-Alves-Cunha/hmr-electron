import { kill } from "node:process";

export function processExists(
	pid: number | undefined,
): boolean {
	if (!pid) {
		console.error(`Invalid pid: \`${pid}\``);
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
