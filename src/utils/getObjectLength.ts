export function getObjectLength(obj: Record<string, unknown>): number {
	let length = 0;

	for (const _ in obj) ++length;

	return length;
}
