import commander from "commander";

import pkg from "../package.json";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

const program = new commander.Command(pkg.name).version(pkg.version);

///////////////////////////////////////////

program
	.command("dev <entry>", { isDefault: true })
	.description("⚡ Start developing your Electron app.")
	.option("--vite [root dir]", "Open Vite server.")
	.option(
		"--preload <file>",
		"Electron preload file relative to the main source",
	)
	.option(
		"--esbuild-config-file <file>",
		"Custom config js|json file to configure Esbuild.",
	)
	.option("--clean-cache", "Clean build cache.")
	.action(async (entryFile: string | undefined, options: DevOptions) => {
		const withVite = Boolean(options.vite);
		let viteRootPath: string | undefined;

		if (typeof options.vite === "string") viteRootPath = options.vite;

		if (options.cleanCache) await cleanCache();

		await run({
			esbuildConfigFile: options.esbuildConfigFile,
			preloadFile: options.preload,
			viteRootPath,
			entryFile,
			withVite,
		});
	});

///////////////////////////////////////////

program
	.command("build [entry]")
	.description("Build your Electron main process code in main source.")
	.option(
		"--preload <file>",
		"Electron preload file relative to the main source",
	)
	.option(
		"--esbuild-config-file <file>",
		"Custom config js|json file to configure Esbuild.",
	)
	.action(async (entryFile: string | undefined, options: BuildOptions) => {
		await build({
			esbuildConfigFile: options.esbuildConfigFile,
			preload: options.preload,
			entryFile,
		});
	});

program.command("clean").action(cleanCache);

///////////////////////////////////////////

program.addHelpText("beforeAll", `Repository: ${pkg.repository}\n`);

///////////////////////////////////////////

program.parseAsync(process.argv).then();

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type DevOptions = Readonly<
	{
		esbuildConfigFile: string;
		vite: string | boolean;
		cleanCache: boolean;
		preload: string;
	}
>;

type BuildOptions = Readonly<{ esbuildConfigFile: string; preload: string; }>;
