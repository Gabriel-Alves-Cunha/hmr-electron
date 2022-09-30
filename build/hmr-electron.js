import { join, resolve, extname, basename } from 'node:path';
import { existsSync, writeFileSync, rmSync, readdirSync, createReadStream } from 'node:fs';
import { build, analyzeMetafile } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { createInterface } from 'node:readline';
import { createServer } from 'vite';

const ansi = (a, b) => (msg) => `\x1B[${a}m${msg}\x1B[${b}m`;
const underline = ansi(4, 24);
const bold = ansi(1, 22);
const bgYellow = ansi(43, 49);
const bgGreen = ansi(42, 49);
const magenta = ansi(35, 39);
const yellow = ansi(33, 39);
const green = ansi(32, 39);
const black = ansi(30, 39);
const blue = ansi(34, 39);
const gray = ansi(90, 39);
const cyan = ansi(36, 39);
const red = ansi(31, 39);
const borderY = "────────────────────────────────────────────────────────────────────────────────";

const consoleMessagePrefix = bgYellow(bold(black("[hmr-electron]")));
const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));
const finishBuildMessage = green(
  `${consoleMessagePrefix} Build finished.`
);
function entryFilePathNotFound(path) {
  return () => throwPrettyError(
    `${underline("entryFilePath")} not found. Received: ${blue(String(path))}`
  );
}
function configFilePathNotFound() {
  return () => throwPrettyError(
    `No config file (${underline("'hmr-electron.config.ts'")}) found.`
  );
}
function fileNotFound(file, path) {
  throwPrettyError(
    `File ${underline(green(`"${file}"`))} not found. Received: ${blue(String(path))}`
  );
}
function viteConfigFileNotFound(cwd) {
  return () => throwPrettyError(
    `Vite config file for main process in "${cwd}" ${underline("NOT")} found.`
  );
}
function throwPrettyError(msg) {
  throw new Error(red(`
${borderY}
${msg}
${borderY}`));
}
function prettyPrintStringArray(arr) {
  const s = arr.map((item) => green(`"${item}"`)).join(", ");
  return `[${s}]`;
}

function findPathOrExit(defaultPaths, notFoundMessage) {
  for (const defaultPlace of defaultPaths) {
    const path = join(process.cwd(), defaultPlace);
    if (existsSync(path))
      return path;
  }
  throw notFoundMessage();
}
const defaultPathsForConfig = [
  "./hmr-electron.config.json",
  "./hmr-electron.config.cts",
  "./hmr-electron.config.mts",
  "./hmr-electron.config.ts",
  "./hmr-electron.config.cjs",
  "./hmr-electron.config.mjs",
  "./hmr-electron.config.js"
];
const defaultPathsForViteConfigFile = [
  "./src/renderer/vite.config.cts",
  "./src/renderer/vite.config.mts",
  "./src/renderer/vite.config.ts",
  "./src/renderer/vite.config.cjs",
  "./src/renderer/vite.config.mjs",
  "./src/renderer/vite.config.js",
  "./src/vite.config.cts",
  "./src/vite.config.mts",
  "./src/vite.config.ts",
  "./src/vite.config.cjs",
  "./src/vite.config.mjs",
  "./src/vite.config.js",
  "./vite.config.cts",
  "./vite.config.mts",
  "./vite.config.ts",
  "./vite.config.cjs",
  "./vite.config.mjs",
  "./vite.config.js"
];
const entryFileDefaultPlaces = [
  "./src/main/index.cjs",
  "./src/main/index.mjs",
  "./src/main/index.js",
  "./src/main/index.cts",
  "./src/main/index.mts",
  "./src/main/index.ts",
  "./src/index.cjs",
  "./src/index.mjs",
  "./src/index.js",
  "./src/index.cts",
  "./src/index.mts",
  "./src/index.ts",
  "./index.cjs",
  "./index.mjs",
  "./index.js",
  "./index.cts",
  "./index.mts",
  "./index.ts"
];

function stringifyJson(obj) {
  return JSON.stringify(obj, null, 2);
}
const logDebug = process.env.DEBUG?.includes("hmr-electron") ?? false;
function dbg(...args) {
  if (logDebug)
    console.dir(args, {
      maxStringLength: 1e3,
      maxArrayLength: 100,
      compact: false,
      sorted: false,
      colors: true,
      depth: 10
    });
}
function logDbg(...args) {
  if (logDebug)
    console.log(...args);
}
logDbg("Hello from the debug side!");

function makeConfigProps(props) {
  const cwd = props.cwd || process.cwd();
  const electronEntryFilePath = resolve(props.electronEntryFilePath);
  const srcPath = props.srcPath ? resolve(props.srcPath) : join(cwd, "src");
  const mainPath = props.mainPath ? resolve(props.mainPath) : join(srcPath, "main");
  const rendererPath = props.rendererPath ? resolve(props.rendererPath) : join(srcPath, "renderer");
  const devOutputPath = props.devOutputPath ? resolve(props.devOutputPath) : join(cwd, "dev-build");
  const preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  let preloadSourceMapFilePath;
  if (props.preloadFilePath) {
    preloadSourceMapFilePath = props.preloadSourceMapFilePath ? resolve(props.preloadSourceMapFilePath) : join(devOutputPath, "preload.js.map");
  }
  const rendererTSconfigPath = props.rendererTSconfigPath ? resolve(props.rendererTSconfigPath) : join(rendererPath, "tsconfig.json");
  const mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(mainPath, "tsconfig.json");
  const nodeModulesPath = props.nodeModulesPath ? resolve(props.nodeModulesPath) : join(cwd, "./node_modules");
  const viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : join(cwd, "vite.config.ts");
  const packageJsonPath = props.packageJsonPath ? resolve(props.packageJsonPath) : join(cwd, "package.json");
  const baseTSconfigPath = props.baseTSconfigPath ? resolve(props.baseTSconfigPath) : join(cwd, "tsconfig.json");
  const buildOutputPath = props.buildOutputPath ? resolve(props.buildOutputPath) : join(cwd, "build");
  const buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(buildOutputPath, "renderer");
  const hmrElectronPath = props.hmrElectronPath ? resolve(props.hmrElectronPath) : join(nodeModulesPath, "hmr-electron");
  const buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(buildOutputPath, "main");
  const esbuildConfig = props.esbuildConfig || {};
  const electronOptions = Array.isArray(props.electronOptions) ? props.electronOptions : [];
  const electronBuiltEntryFile = join(devOutputPath, "main", "index.cjs");
  let electronEnviromentVariables = {};
  if (props.electronEnviromentVariables) {
    electronEnviromentVariables = props.electronEnviromentVariables;
  }
  const newProps = {
    electronEnviromentVariables,
    preloadSourceMapFilePath,
    buildRendererOutputPath,
    electronBuiltEntryFile,
    electronEntryFilePath,
    rendererTSconfigPath,
    buildMainOutputPath,
    baseTSconfigPath,
    mainTSconfigPath,
    electronOptions,
    buildOutputPath,
    hmrElectronPath,
    packageJsonPath,
    nodeModulesPath,
    preloadFilePath,
    viteConfigPath,
    devOutputPath,
    esbuildConfig,
    rendererPath,
    mainPath,
    srcPath,
    cwd
  };
  let exit = false;
  Object.entries(props).forEach(([key, filePath]) => {
    if (!key || !filePath || except.includes(key))
      return;
    if (!existsSync(filePath)) {
      console.error(fileNotFound(key, filePath));
      exit = true;
    }
  });
  if (exit) {
    console.log("Resolved config props:", stringifyJson(props));
    throw throwPrettyError("Resolve the errors above and try again.");
  }
  logDbg("Resolved config props:", newProps);
  return newProps;
}
const except = [
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "devOutputPath"
];

function makeTempFileWithData(extension, dataToFillFileWith) {
  const filepath = join(tmpdir(), randomBytes(16).toString("hex") + extension);
  try {
    writeFileSync(filepath, dataToFillFileWith);
    return filepath;
  } catch (error) {
    throw error;
  }
}

const require2 = createRequire(import.meta.url);

async function readConfigFile(filePath) {
  if (!filePath || !existsSync(filePath))
    throwPrettyError(`There must be a config file! Received: "${filePath}"`);
  let filenameChanged = false;
  try {
    if (tsExtensions.includes(extname(filePath))) {
      const buildResult = await build({
        logLevel: logDebug ? "debug" : "silent",
        minifyIdentifiers: false,
        minifyWhitespace: false,
        entryPoints: [filePath],
        minifySyntax: false,
        treeShaking: true,
        target: "esnext",
        sourcemap: false,
        platform: "node",
        charset: "utf8",
        format: "cjs",
        logLimit: 10,
        write: false,
        color: true
      });
      const [outputFile] = buildResult.outputFiles;
      if (!outputFile)
        throwPrettyError(
          `Output for transpiling ts -> js on 'readConfigFile()' not present! ${stringifyJson(buildResult)}`
        );
      const { text } = outputFile;
      logDbg(green(`Text result from readConfigFile():

${bold(text)}`));
      filePath = makeTempFileWithData(".js", text);
      filenameChanged = true;
    }
    const { default: userConfig } = require2(filePath);
    logDbg(green(`Config = ${stringifyJson(userConfig)}`));
    if (!userConfig)
      throwPrettyError("Config file is required!");
    if (!userConfig.electronEntryFilePath)
      throwPrettyError("config.electronEntryFilePath is required!");
    return userConfig;
  } catch (error) {
    return throwPrettyError(String(error));
  } finally {
    if (filenameChanged)
      rmSync(filePath);
  }
}
const tsExtensions = [".ts", ".mts", ".cts"];

async function cleanCache(config) {
  await rm(config.buildOutputPath, { recursive: true, force: true });
  await rm(config.devOutputPath, { recursive: true, force: true });
}

async function runEsbuildForMainProcess(props, onError, onBuildComplete) {
  const tsconfigPath = join(props.mainPath, "tsconfig.json") || props.baseTSconfigPath;
  const entryPoints = [props.electronEntryFilePath];
  let count = 0;
  if (props.preloadFilePath) {
    entryPoints.push(props.preloadFilePath);
    console.log(
      `	Using preload file: "${getRelativePreloadFilePath(props)}"
`
    );
  }
  try {
    await cleanCache(props);
    const buildResult = await build({
      outdir: props.isBuild ? props.buildMainOutputPath : join(props.devOutputPath, "main"),
      external: await findExternals(props),
      outExtension: { ".js": ".cjs" },
      incremental: !props.isBuild,
      tsconfig: tsconfigPath,
      sourcesContent: false,
      treeShaking: true,
      logLevel: "debug",
      platform: "node",
      target: "esnext",
      sourcemap: true,
      metafile: true,
      minify: false,
      format: "cjs",
      bundle: true,
      logLimit: 10,
      color: true,
      entryPoints,
      ...props.esbuildConfig,
      watch: props.isBuild ? false : {
        onRebuild: async (error) => {
          error ? onError(transformErrors(error)) : onBuildComplete(props, count++);
        }
      }
    });
    ++count;
    dbg("Build result:", buildResult);
    if (buildResult.metafile) {
      const metafile = await analyzeMetafile(buildResult.metafile, {
        verbose: true
      });
      console.log("Esbuild build result metafile:\n", metafile);
    }
    onBuildComplete(props, count);
  } catch (error) {
    if (isBuildFailure(error))
      onError(transformErrors(error));
    else
      console.error(error);
  }
}
async function findExternals(props) {
  if (!existsSync(props.packageJsonPath))
    throwPrettyError("Could not find a valid package.json");
  const packageJson = require2(props.packageJsonPath);
  const externals = /* @__PURE__ */ new Set();
  dbg({ packageJson });
  dependenciesKeys.forEach((depKey) => {
    const obj = packageJson[depKey] ?? {};
    Object.keys(obj).forEach((name) => externals.add(name));
  });
  if (existsSync(props.nodeModulesPath)) {
    const modules = readdirSync(props.nodeModulesPath);
    modules.forEach((mod) => externals.add(mod));
  }
  dbg("Modules found to use as externals:", externals);
  return [...externals];
}
function transformErrors(error) {
  return error.errors.map((e) => ({
    location: e.location,
    message: e.text
  }));
}
function isBuildFailure(err) {
  return err && err.errors && Array.isArray(err.errors);
}
function getRelativePreloadFilePath(config) {
  return config.preloadFilePath?.substring(config.cwd.length) ?? "";
}
const dependenciesKeys = [
  "peerDependencies",
  "devDependencies",
  "dependencies"
];

const categoryMessage = red("[ERROR]");
const border = red(borderY);
function formatCompileError(err) {
  if (!err.location)
    return err.message;
  const pathMessage = `file: ${cyan(err.location.file)}
line: ${yellow(String(err.location.line))}
column: ${yellow(String(err.location.column))}

`;
  const code = `${gray(String(err.location.line))} ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 1 + 1)}
${red("~".repeat(err.location.length))} ${" ".repeat(
    err.location.lineText.length - err.location.column - err.location.length
  )}`;
  return `${categoryMessage} ${border} - ${pathMessage} ${err.message}

${code}
${border}`;
}

function diagnoseErrors(errors) {
  const output = formatDiagnosticsMessage(errors);
  console.error(output);
}
function formatDiagnosticsMessage(errors) {
  const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
  const messages = errors.map((e) => formatCompileError(e));
  let diagnosticDetail = "";
  messages.forEach((msg, index, { length }) => {
    diagnosticDetail += msg.split("\n").map((detail) => `  • ${detail}.`).join(
      "\n"
    );
    if (index + 1 !== length)
      diagnosticDetail += "\n";
  });
  const result = `${borderY}
${consoleMessagePrefix} ${magenta("Some typescript compilation errors occurred:")}

${diagnosticDetail}

${magenta(errorMessage)}
${borderY}`;
  return result;
}

const removeJunkTransformOptions = {
  decodeStrings: false,
  transform(chunk, _encoding, doneCb) {
    const source = chunk.toString();
    if (junkRegex_1.test(source))
      return false;
    if (junkRegex_2.test(source))
      return false;
    if (junkRegex_3.test(source))
      return false;
    doneCb(null, chunk);
    return;
  }
};
const junkRegex_1 = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;

const stopElectronFns = [];
let exitBecauseOfUserCode = false;
async function runElectron({
  electronEnviromentVariables,
  electronBuiltEntryFile,
  electronOptions,
  silent = false
}) {
  stopElectronFns.forEach((stopElectron) => stopElectron());
  if (electronOptions.length === 0)
    electronOptions = [
      "--enable-source-maps",
      "--node-memory-debug",
      "--trace-warnings",
      "--trace-uncaught",
      "--trace-warnings"
    ];
  if (Object.keys(electronEnviromentVariables).length === 0)
    electronEnviromentVariables = { ...process.env, FORCE_COLOR: "2" };
  else
    electronEnviromentVariables = {
      ...electronEnviromentVariables,
      ...process.env
    };
  const electronProcess = spawn("electron", [
    ...electronOptions,
    electronBuiltEntryFile
  ], { env: electronEnviromentVariables }).on("exit", (code) => {
    if (!exitBecauseOfUserCode)
      throw new Error(gray(`Electron exited with code ${code}.`));
    exitBecauseOfUserCode = true;
  }).on("close", (code, signal) => {
    console.log(`Process closed with code ${code}, ${signal}`);
    process.exit(code ?? void 0);
  }).on("error", (err) => {
    throw throwPrettyError(
      "Error from child_process running Electron:\n" + String(err)
    );
  });
  electronProcess.stdout.on("data", (data) => {
    console.log(data);
  });
  function createStopElectronFn() {
    let called = false;
    return () => {
      if (!called && electronProcess.pid) {
        electronProcess.removeAllListeners();
        process.kill(electronProcess.pid);
        exitBecauseOfUserCode = true;
      }
      called = true;
    };
  }
  const stopElectronFn = createStopElectronFn();
  stopElectronFns.push(stopElectronFn);
  if (!silent) {
    const removeElectronLoggerJunkOutput = new Transform(
      removeJunkTransformOptions
    );
    const removeElectronLoggerJunkErrors = new Transform(
      removeJunkTransformOptions
    );
    electronProcess.stdout.pipe(removeElectronLoggerJunkOutput).pipe(
      process.stdout
    );
    electronProcess.stderr.pipe(removeElectronLoggerJunkErrors).pipe(
      process.stderr
    );
  }
  return [electronProcess, stopElectronFn];
}

function prompt(question) {
  const questionAndPrompt = `${green("?")} ${question} (Y/n) `;
  const output = process.stdout;
  const input = process.stdin;
  const readline = createInterface({ input, output });
  let answerResolve = () => {
  };
  const answerPromise = new Promise((resolve) => {
    answerResolve = resolve;
  });
  readline.question(questionAndPrompt, (answer) => {
    answerResolve(answer === "Y" || answer == "y");
    readline.close();
  });
  return [() => answerPromise, () => {
    console.log();
    readline.close();
  }];
}

async function runBuild(config) {
  await runEsbuildForMainProcess(
    { ...config, isBuild: true },
    diagnoseErrors,
    promptToRerunElectron
  );
}
let stopPromptToRunElectron = () => {
};
async function promptToRerunElectron(config, count) {
  stopPromptToRunElectron();
  console.log(finishBuildMessage);
  if (count > 1) {
    const [readAnswer, stopPrompt] = prompt(
      bgYellow(black(bold(`[${count}x | ${dateFormatted()}]`))) + needToRerunElectron
    );
    stopPromptToRunElectron = stopPrompt;
    if (await readAnswer())
      await runElectron(config);
  } else {
    await runElectron(config);
  }
}
function dateFormatted() {
  const date = new Date();
  return [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds())
  ].join(":");
}
const needToRerunElectron = green("Need to rerun Electron?");
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function electronPreloadSourceMapVitePlugin(preloadSourceMapFilePath) {
  const plugin = {
    name: "electron-preload-sourcemap",
    configureServer(server) {
      if (!preloadSourceMapFilePath)
        return;
      server.middlewares.use((req, res, next) => {
        if (req.originalUrl && req.originalUrl === preloadSourceMapFilePath) {
          createReadStream(preloadSourceMapFilePath).pipe(res);
          return;
        }
        next();
      });
    }
  };
  return plugin;
}

function LoggerPlugin(srcPath) {
  const plugin = {
    name: "electron-hmr-logger",
    handleHotUpdate(ctx) {
      if (!srcPath)
        throw new Error(`There must be a srcPath! Received: ${srcPath}`);
      ctx.modules.forEach(({ file }) => {
        if (!file)
          return;
        console.log(
          viteConsoleMessagePrefix,
          yellow("HMR update on:"),
          underline(gray(basename(srcPath)))
        );
      });
      return ctx.modules;
    }
  };
  return plugin;
}

async function startViteServer(config) {
  const server = await createServer({
    esbuild: {
      logLevel: logDebug ? "debug" : "silent",
      minifyIdentifiers: false,
      minifyWhitespace: false,
      minifySyntax: false,
      treeShaking: true,
      target: "esnext",
      sourcemap: true,
      charset: "utf8",
      format: "esm",
      logLimit: 10,
      color: true
    },
    plugins: [
      electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
      LoggerPlugin(config.cwd)
    ],
    logLevel: "info",
    build: { outDir: "src/renderer" },
    configFile: config.viteConfigPath
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (address && typeof address === "object") {
    const { port } = address;
    console.log(
      bold(
        green(
          `${viteConsoleMessagePrefix} Dev server running at port ${port}.`
        )
      )
    );
  }
}

async function runDev(config) {
  findPathOrExit(
    [config.viteConfigPath, ...defaultPathsForViteConfigFile],
    viteConfigFileNotFound(config.cwd)
  );
  await startViteServer(config);
  findPathOrExit(
    [config.electronEntryFilePath, ...entryFileDefaultPlaces],
    entryFilePathNotFound(config.electronEntryFilePath)
  );
  await runEsbuildForMainProcess(
    { ...config, isBuild: false },
    diagnoseErrors,
    promptToRerunElectron
  );
}

const name = "hmr-electron";
const version = "0.0.1";

async function parseCliArgs() {
  const args = argsAsObj(usefullArgs());
  if (Object.keys(args).length === 0)
    return printHelpMsg();
  const configFilePathFromArgs = args["--config-file"];
  const configFilePath = configFilePathFromArgs ? resolve(configFilePathFromArgs) : findPathOrExit(defaultPathsForConfig, configFilePathNotFound());
  const userConfig = await readConfigFile(configFilePath);
  const configProps = makeConfigProps(userConfig);
  if (args["clean"])
    return await cleanCache(configProps);
  if (args["dev"]) {
    if (args["--clean-cache"])
      await cleanCache(configProps);
    return await runDev(configProps);
  }
  if (args["build"]) {
    await cleanCache(configProps);
    return await runBuild(configProps);
  }
  printHelpMsg();
  console.log(
    `No commands matched. Args = ${prettyPrintStringArray(process.argv)}`
  );
}
function usefullArgs() {
  const args = process.argv;
  const reversedArgs = args.slice().reverse();
  logDbg(`Original args = ${prettyPrintStringArray(args)}`);
  let indexToSliceFrom = 0;
  for (const arg of reversedArgs) {
    logDbg({ arg, nameToMatch: name, index: arg.lastIndexOf(name) });
    const indexOfThisPkgCommand = arg.lastIndexOf(name);
    if (indexOfThisPkgCommand === -1)
      continue;
    ++indexToSliceFrom;
    break;
  }
  const argsToUse = args.slice(indexToSliceFrom + 1);
  logDbg(
    `Modified args = ${prettyPrintStringArray(argsToUse)}
indexToSliceFrom = ${indexToSliceFrom}`
  );
  return argsToUse;
}
function argsAsObj(args) {
  const obj = {};
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (!key)
      return;
    if (!value)
      obj[key] = true;
    else
      obj[key] = value;
  });
  logDbg("argsAsObj =", stringifyJson(obj));
  return obj;
}
function printHelpMsg() {
  console.log(`${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage")}: ${name} [command] [options]

  You must have an ${blue("hmr-electron.config.(ts|js)")}
  file at the root of your package.

${bold("Commands:")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}
const greenEqual = green("=");

parseCliArgs();
