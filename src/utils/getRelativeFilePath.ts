export function getRelativePreloadFilePath(path: string, cwd: string): string {
	return path.substring(cwd.length);
}
