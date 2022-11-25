import { resolve, join, extname } from 'node:path';
import { env, exit, cwd, kill, argv } from 'node:process';
import { log, dir, error } from 'node:console';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { build } from 'esbuild';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { build as build$1, createServer } from 'vite';

function findPathOrExit(defaultPaths, notFoundMessage) {
  for (const fullPath of defaultPaths())
    if (existsSync(fullPath))
      return fullPath;
  notFoundMessage();
}
const extensions = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"];
const hmrElectronConfig = "hmr-electron.config.";
const viteConfig = "vite.config.";
function* defaultPathsForConfig() {
  for (const ext of extensions)
    yield resolve(`${hmrElectronConfig}${ext}`);
}
function* defaultPathsForViteConfigFile() {
  for (const ext of extensions)
    yield resolve(`${viteConfig}${ext}`);
  for (const ext of extensions)
    yield resolve("src", `${viteConfig}${ext}`);
  for (const ext of extensions)
    yield resolve("src", "renderer", `${viteConfig}${ext}`);
}

const ansi = (a, b) => (msg) => `\x1B[${a}m${msg}\x1B[${b}m`;
const underline = ansi(4, 24);
const bold = ansi(1, 22);
const bgYellow = ansi(43, 49);
const bgGreen = ansi(42, 49);
const bgBlue = ansi(44, 49);
const magenta = ansi(35, 39);
const yellow = ansi(33, 39);
const green = ansi(32, 39);
const black = ansi(30, 39);
const blue = ansi(34, 39);
const gray = ansi(90, 39);
const cyan = ansi(36, 39);
const red = ansi(31, 39);
const borderY = "────────────────────────────────────────────────────────────────────────────────";

function getPrettyDate() {
  const date = new Date();
  return bgBlue(
    bold(
      black(
        `[${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
          date.getSeconds()
        )} ${pad(date.getMilliseconds(), 3)}]`
      )
    )
  );
}
const pad = (num, padding = 2) => num.toString().padStart(padding, "0");

const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));
const hmrElectronConsoleMessagePrefix = bgYellow(
  bold(black("[hmr-electron]"))
);
function configFilePathNotFound() {
  throwPrettyError(
    `No config file (${underline("'hmr-electron.config.ts'")}) found.`
  );
}
function fileNotFound(file, path) {
  return `File ${underline(green(`"${file}"`))} not found. Received: ${blue(
    path
  )}`;
}
function viteConfigFileNotFound() {
  throwPrettyError(
    `Vite config file for main process ${underline("NOT")} found.`
  );
}
function throwPrettyError(msg) {
  msg = `
${red(borderY)}
${getPrettyDate()} ${msg}
${red(borderY)}
`;
  throw new Error(msg);
}
function prettyPrintStringArray(arr) {
  const arrayItems = arr.map((item) => green(`"${item}"`)).join(", ");
  return `[ ${arrayItems} ]`;
}
function hmrElectronLog(...args) {
  log(getPrettyDate(), hmrElectronConsoleMessagePrefix, ...args);
}
function viteLog(...args) {
  log(getPrettyDate(), viteConsoleMessagePrefix, ...args);
}

const stringifyJson = (obj) => JSON.stringify(obj, null, 2);
const doLogConfig = env.DEBUG?.includes("hmr-electron:config-result") ?? false;
const doLogDebug = env.DEBUG?.includes("hmr-electron") ?? false;
const options$2 = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: false,
  sorted: false,
  colors: true,
  depth: 10
};
function dbg(...args) {
  doLogDebug && log(...args);
}
function logConfig(...args) {
  doLogConfig && dir(args, options$2);
}
dbg("Hello from the debug side!");

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function parseEnvFile(src) {
  const obj = {};
  let lines = src.replace(/\r\n?/gm, "\n");
  let match;
  while ((match = LINE.exec(lines)) !== null) {
    const key = match[1];
    let value = (match[2] ?? "").trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function addEnvToNodeProcessEnv(dotenvPath) {
  try {
    const parsed = parseEnvFile(
      readFileSync(dotenvPath, { encoding: "utf-8" })
    );
    for (const key of Object.keys(parsed))
      Object.hasOwn(env, key) ? hmrElectronLog(
        `"${key}" is already defined in \`process.env\` and was NOT overwritten!`
      ) : env[key] = parsed[key];
  } catch (error) {
    hmrElectronLog(`Failed to load ${dotenvPath} ${error.message}`);
    exit(1);
  }
}

function makeConfigProps(props) {
  const {
    electronOptions = [
      "--disallow-code-generation-from-strings",
      "--pending-deprecation",
      "--enable-source-maps",
      "--trace-deprecation",
      "--throw-deprecation",
      "--trace-uncaught",
      "--trace-warnings",
      "--deprecation",
      "--warnings",
      "--inspect"
    ],
    electronEsbuildExternalPackages = [],
    readEnviromentVariables = false,
    viteExternalPackages = [],
    esbuildIgnore = [],
    esbuildConfig = {},
    root = cwd()
  } = props;
  if (readEnviromentVariables)
    addEnvToNodeProcessEnv(join(root, ".env"));
  env["FORCE_COLOR"] = "2";
  console.log(env);
  electronEsbuildExternalPackages.push(
    ...allBuiltinModules,
    "electron",
    "esbuild",
    "vite"
  );
  esbuildIgnore.push(/node_modules/);
  const srcPath = resolve(props.srcPath ?? "src");
  const mainPath = props.mainPath ? resolve(props.mainPath) : join(srcPath, main);
  const devOutputPath = resolve(props.devOutputPath ?? "dev-build");
  const devBuildMainOutputPath = props.devBuildMainOutputPath ? resolve(props.devBuildMainOutputPath) : join(devOutputPath, main);
  const devBuildRendererOutputPath = join(devOutputPath, renderer);
  const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath ? resolve(props.devBuildElectronEntryFilePath) : join(devBuildMainOutputPath, "index.cjs");
  const preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  const mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(mainPath, tsconfigJson);
  const viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : findPathOrExit(defaultPathsForViteConfigFile, viteConfigFileNotFound);
  const buildOutputPath = resolve(props.buildOutputPath ?? "build");
  const buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(buildOutputPath, renderer);
  const buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(buildOutputPath, main);
  const electronEntryFilePath = resolve(props.electronEntryFilePath);
  const newConfig = {
    electronEsbuildExternalPackages,
    devBuildElectronEntryFilePath,
    devBuildRendererOutputPath,
    buildRendererOutputPath,
    readEnviromentVariables,
    devBuildMainOutputPath,
    electronEntryFilePath,
    viteExternalPackages,
    buildMainOutputPath,
    mainTSconfigPath,
    electronOptions,
    buildOutputPath,
    preloadFilePath,
    viteConfigPath,
    devOutputPath,
    esbuildConfig,
    esbuildIgnore,
    mainPath,
    srcPath,
    root
  };
  validateFilesExists(newConfig);
  logConfig("Resolved config props:", newConfig);
  return newConfig;
}
function validateFilesExists(config) {
  let doExit = false;
  for (const [key, filePath] of Object.entries(config)) {
    if (!(key && filePath) || typeof filePath !== "string" || except.includes(key))
      continue;
    if (!existsSync(filePath)) {
      error(fileNotFound(key, filePath));
      doExit = true;
    }
  }
  if (doExit) {
    log("Resolved config config:", stringifyJson(config));
    throwPrettyError("Resolve the errors above and try again.");
  }
}
const except = [
  "devBuildElectronEntryFilePath",
  "devBuildRendererOutputPath",
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "devBuildMainOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "viteConfigPath",
  "devOutputPath"
];
const allBuiltinModules = builtinModules.map((module) => `node:${module}`).concat(builtinModules);
const tsconfigJson = "tsconfig.json";
const renderer = "renderer";
const main = "main";

function makeConfigFile() {
  const dataToFillFileWith = `import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
  try {
    writeFileSync(resolve("hmr-electron.config.ts"), dataToFillFileWith);
  } catch (error) {
    throw error;
  }
}

async function readConfigFile(filePath) {
  !existsSync(filePath) && throwPrettyError(`There must be a config file! Received: "${filePath}"`);
  const outfile = "config-file-hmr-electron.mjs";
  let hasTranspilationHappened = false;
  const out = join(tmpdir(), outfile);
  try {
    if (tsExtensions.includes(extname(filePath))) {
      const buildResult = await build({
        minifyIdentifiers: false,
        minifyWhitespace: false,
        entryPoints: [filePath],
        minifySyntax: false,
        treeShaking: true,
        outdir: tmpdir(),
        sourcemap: false,
        target: "esnext",
        logLevel: "info",
        platform: "node",
        charset: "utf8",
        format: "esm",
        logLimit: 10,
        color: true,
        write: true,
        outfile
      });
      hasTranspilationHappened = true;
    }
    const { default: userConfig } = await (hasTranspilationHappened ? import(out) : import(filePath));
    logConfig(`User config = ${stringifyJson(userConfig)}`);
    if (!userConfig)
      throwPrettyError("Config file is required!");
    if (!userConfig.electronEntryFilePath)
      throwPrettyError("`config.electronEntryFilePath` is required!");
    return userConfig;
  } catch (e) {
    return throwPrettyError(e);
  }
}
const tsExtensions = [".ts", ".mts", ".cts"];

function cleanCache(config) {
  rmSync(config.buildOutputPath, options$1);
  rmSync(config.devOutputPath, options$1);
}
const options$1 = { recursive: true, force: true };

const removeJunkLogs = {
  transform(chunk, _encoding, doneCb) {
    const source = chunk.toString();
    const error = null;
    if (source.includes(junkError_1, 49) || junkRegex_1.test(source) || junkRegex_2.test(source) || junkRegex_3.test(source))
      return;
    doneCb(error, source);
  }
};
const junkRegex_1 = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;
const junkError_1 = "unknown libva error, driver_name = (null)";

function stopPreviousElectronAndStartANewOne({
  devBuildElectronEntryFilePath,
  electronOptions,
  isTest = false
}) {
  killPreviousElectronProcesses();
  const electron_process = spawn(
    "electron",
    isTest ? [""] : [...electronOptions, devBuildElectronEntryFilePath]
  ).on("exit", () => exit(0)).on("spawn", () => {
    previousElectronProcesses.set(
      electron_process.pid,
      electron_process
    );
    hmrElectronLog("Electron reloaded");
    dbg(
      `Electron child process has been spawned with args: ${prettyPrintStringArray(
        electron_process.spawnargs
      )}`
    );
  });
  const removeElectronLoggerJunkOutput = new Transform(removeJunkLogs);
  const removeElectronLoggerJunkErrors = new Transform(removeJunkLogs);
  electron_process.stdout.pipe(removeElectronLoggerJunkOutput).pipe(process.stdout);
  electron_process.stderr.pipe(removeElectronLoggerJunkErrors).pipe(process.stderr);
  return electron_process;
}
const previousElectronProcesses = /* @__PURE__ */ new Map();
function killPreviousElectronProcesses() {
  for (const [pid, electron_process] of previousElectronProcesses)
    try {
      electron_process.removeAllListeners();
      electron_process.on("exit", () => previousElectronProcesses.delete(pid));
      kill(pid);
    } catch (e) {
      hmrElectronLog("Error when killing Electron process:", e);
    }
}

function ignoreDirectoriesAndFiles(regexOfDirs) {
  const plugin = {
    name: "ignore-directories-and-files",
    setup(build) {
      build.onResolve(options, (args) => ({ path: args.path, namespace }));
      for (const regex of regexOfDirs) {
        build.onResolve({ filter: regex }, (args) => {
          if (args.path.match(regex)) {
            hmrElectronLog(`Ignoring "${args.path}"`);
            return { path: args.path, namespace };
          } else
            return { path: args.path };
        });
      }
      build.onLoad(options, () => ({
        contents: ""
      }));
    }
  };
  return plugin;
}
const regexForEverything = /[\s\S]*/gm;
const namespace = "ignore";
const options = { filter: regexForEverything, namespace };

async function runEsbuildForMainProcess(props, onError) {
  const entryPoints = [props.electronEntryFilePath];
  if (props.preloadFilePath) {
    entryPoints.push(props.preloadFilePath);
    hmrElectronLog(
      `Using preload file: "${props.preloadFilePath.substring(props.root.length)}".`
    );
  }
  try {
    const buildResult = await build({
      plugins: [
        ignoreDirectoriesAndFiles(props.esbuildIgnore)
      ],
      outdir: props.isBuild ? props.buildMainOutputPath : props.devBuildMainOutputPath,
      external: props.electronEsbuildExternalPackages,
      minifyIdentifiers: props.isBuild,
      tsconfig: props.mainTSconfigPath,
      minifyWhitespace: props.isBuild,
      outExtension: { ".js": ".cjs" },
      minifySyntax: props.isBuild,
      minify: props.isBuild,
      sourcesContent: false,
      sourcemap: "external",
      legalComments: "none",
      incremental: false,
      treeShaking: true,
      logLevel: "info",
      platform: "node",
      target: "esnext",
      charset: "utf8",
      format: "cjs",
      logLimit: 10,
      bundle: true,
      color: true,
      entryPoints,
      watch: props.isBuild ? false : {
        onRebuild(error2) {
          if (error2)
            return onError(transformErrors(error2));
          stopPreviousElectronAndStartANewOne(props);
        }
      },
      ...props.esbuildConfig
    });
    if (buildResult.errors.length)
      hmrElectronLog("Esbuild build errors:\n", buildResult.errors);
    if (!props.isBuild)
      stopPreviousElectronAndStartANewOne(props);
  } catch (err) {
    isBuildFailure(err) ? onError(transformErrors(err)) : error(err);
  }
}
const transformErrors = (err) => err.errors.map((e) => ({
  location: e.location,
  message: e.text
}));
const isBuildFailure = (err) => Array.isArray(err?.errors);

async function runViteFrontendBuild(config) {
  const isBuild = true;
  await build$1({
    esbuild: viteESbuildOptions("browser", "esm", isBuild),
    build: viteBuildOptions(config, "esm", isBuild),
    css: { devSourcemap: true },
    mode: "production",
    logLevel: "info",
    configFile: config.viteConfigPath
  });
}
const viteBuildOptions = (config, format, isBuild) => {
  const buildOptions = {
    outDir: isBuild ? config.buildRendererOutputPath : config.devBuildRendererOutputPath,
    sourcemap: isBuild ? false : "inline",
    minify: isBuild ? "esbuild" : false,
    chunkSizeWarningLimit: 1e3,
    reportCompressedSize: false,
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      external: config.viteExternalPackages,
      preserveEntrySignatures: "strict",
      strictDeprecations: true,
      output: {
        sourcemap: isBuild ? false : "inline",
        assetFileNames: "assets/[name].[ext]",
        minifyInternalExports: isBuild,
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name].mjs",
        compact: isBuild,
        format,
        generatedCode: {
          objectShorthand: true,
          constBindings: true,
          preset: "es2015"
        }
      }
    }
  };
  return buildOptions;
};
const viteESbuildOptions = (platform, format, isBuild) => ({
  minifyIdentifiers: isBuild,
  minifyWhitespace: isBuild,
  sourcesContent: false,
  legalComments: "none",
  sourcemap: "external",
  minifySyntax: isBuild,
  treeShaking: true,
  target: "esnext",
  logLevel: "info",
  charset: "utf8",
  logLimit: 10,
  color: true,
  platform,
  format
});

const categoryMessage = red("[ERROR]");
const border = red(borderY);
function formatCompileError(err) {
  if (!err.location)
    return err.message;
  const pathMessage = `file: ${cyan(`"${err.location.file}"`)}
line: ${yellow(err.location.line)}
column: ${yellow(err.location.column)}
`;
  const code = `${gray(`${err.location.line} |`)}  ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 4)}${red("~".repeat(err.location.length))}`;
  return `${getPrettyDate()} ${categoryMessage}
${border}
${pathMessage}
${err.message}

${code}

${border}`;
}

const diagnoseErrors = (errors) => error(formatDiagnosticsMessage(errors));
function formatDiagnosticsMessage(errors) {
  const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
  const messages = errors.map((err) => formatCompileError(err));
  const length = messages.length;
  let diagnosticsDetails = "";
  let index = 0;
  for (const msg of messages) {
    diagnosticsDetails += `  • ${msg}.`;
    if (index + 1 !== length)
      diagnosticsDetails += "\n";
  }
  return `${magentaBorder}
${hmrElectronConsoleMessagePrefix} ${magenta(
    "Some typescript compilation errors occurred:"
  )}

${diagnosticsDetails}

${magenta(errorMessage)}
${magentaBorder}`;
}
const magentaBorder = magenta(borderY);

async function runBuild(config) {
  await Promise.all([
    runEsbuildForMainProcess({ ...config, isBuild: true }, diagnoseErrors),
    runViteFrontendBuild(config)
  ]);
}

async function startViteFrontendServer(config) {
  const isBuild = false;
  const server = await (await createServer({
    esbuild: viteESbuildOptions("browser", "esm", isBuild),
    build: viteBuildOptions(config, "esm", isBuild),
    css: { devSourcemap: true },
    mode: "development",
    logLevel: "info",
    configFile: config.viteConfigPath
  })).listen();
  logConfig("Vite server config =", stringifyJson(server.config));
  const { address, port } = server.httpServer.address();
  viteLog(
    bold(
      green(
        `Dev server running at address ${underline(
          `http://${address}:${port}`
        )}.`
      )
    )
  );
}

async function runDev(config) {
  await Promise.all([
    runEsbuildForMainProcess({ ...config, isBuild: false }, diagnoseErrors),
    startViteFrontendServer(config)
  ]);
}

const name = "hmr-electron";
const version = "0.0.7";

async function parseCliArgs() {
  const args = argsAsObj();
  if (Object.keys(args).length === 0)
    return printHelpMsg();
  const configFilePathFromArgs = args["--config-file"];
  const configFilePath = configFilePathFromArgs ? resolve(configFilePathFromArgs) : findPathOrExit(defaultPathsForConfig, configFilePathNotFound);
  const userConfig = await readConfigFile(configFilePath);
  const configProps = makeConfigProps(userConfig);
  if (args["init"])
    return makeConfigFile();
  if (args["clean"])
    return cleanCache(configProps);
  if (args["dev"]) {
    if (args["--clean-cache"])
      cleanCache(configProps);
    return await runDev(configProps);
  }
  if (args["build"]) {
    cleanCache(configProps);
    return await runBuild(configProps);
  }
  hmrElectronLog(`No commands matched. Args = ${args}`);
}
function argsAsObj() {
  const obj = {};
  for (const arg of argv.slice(2)) {
    const [key, value] = arg.split("=");
    if (!key)
      continue;
    if (!value)
      obj[key] = true;
    else if (value === "false")
      obj[key] = false;
    else
      obj[key] = value;
  }
  dbg("argsAsObj =", stringifyJson(obj));
  return obj;
}
function printHelpMsg() {
  log(`${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage:")} ${name} [command] [options]

  You must have a config file ('${blue("hmr-electron.config.ts")}')
  file at the root of your package.

${bold("Commands and options:")}
	init  ${blue("Make a config file")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}
const greenEqual = green("=");

parseCliArgs();
