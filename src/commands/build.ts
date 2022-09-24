export async function build(
	{ entryFile, esbuildConfigFile, preload }: BuildOptions,
): Promise<void> {
	// TODO move to PathManager.ts
	// find entry first
	const entryPath = await findPathOrExit(
		entryFile,
		defaultEntryList,
		cannotFoundEntryScriptOrViteRootPath(process.cwd()),
	);

	await runEsbuildForMainProcess({
		isBuild: true,
		outputDirectory: 
	})
}

const defaultEntryList = [
	"./src/main/index.js",
	"./src/main/index.ts",
	"./src/index.js",
	"./src/index.ts",
	"./index.js",
	"./index.ts",
];

type BuildOptions = Readonly<{
	esbuildConfigFile?: string; // Filename of the esbuild config file.
	entryFile?: string;
	preload?: string; // Filename of the preload file.
}>;
