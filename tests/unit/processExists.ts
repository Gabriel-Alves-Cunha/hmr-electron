import { exec } from "node:child_process";

export function processExists(
	processNameOrPid: string | number | undefined,
): Promise<boolean> {
	if (!processNameOrPid) {
		console.error("processNameOrPid is invalid:", processNameOrPid);
		return false;
	}

	processNameOrPid = String(processNameOrPid);

	const cmd = (() => {
		switch (process.platform) {
			case "win32":
				return "tasklist";
			case "darwin":
				return `ps -ax | grep ${processNameOrPid}`;
			case "linux":
				return "ps -A";
			default:
				return "false";
		}
	})();

	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout) => {
			if (err) reject(err);

			const hasProcess = stdout.includes(processNameOrPid);

			resolve(hasProcess);
		});
	});
}
