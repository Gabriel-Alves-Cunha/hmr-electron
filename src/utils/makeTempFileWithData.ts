import { writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function makeTempFileWithData(
	extension: string,
	dataToFillFileWith: string,
): string {
	const filepath = join(tmpdir(), randomBytes(16).toString("hex") + extension);

	try {
		writeFileSync(filepath, dataToFillFileWith);

		return filepath;
	} catch (error) {
		throw error;
	}
}
