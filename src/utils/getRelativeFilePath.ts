export function getRelativeFilePath(path: string, cwd: string): string {
	return path.substring(cwd.length);
}
