import { join, resolve, extname, basename } from 'node:path';
import { existsSync, writeFileSync, rmSync, createReadStream } from 'node:fs';
import { build, analyzeMetafile } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { rm, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { createInterface } from 'node:readline';
import { createServer } from 'vite';

const wrap = (a, b) => (msg) => `\x1B[${a}m${msg}\x1B[${b}m`;
const underline = wrap(4, 24);
const bold = wrap(1, 22);
const bgYellow = wrap(43, 49);
const bgGreen = wrap(42, 49);
const bgBlue = wrap(44, 49);
const bgRed = wrap(31, 49);
const magenta = wrap(35, 39);
const yellow = wrap(33, 39);
const white = wrap(37, 39);
const green = wrap(32, 39);
const black = wrap(30, 39);
const blue = wrap(34, 39);
const gray = wrap(90, 39);
const cyan = wrap(36, 39);
const red = wrap(31, 39);
const borderY = "────────────────────────────────────────────────────────────────────────────────";

const consoleMessagePrefix = bgYellow(black("[hmr-electron]"));
const finishBuildMessage = green(
  `${consoleMessagePrefix} Build finished.`
);
const entryFilePathNotFound = (path) => () => prettyError(
  `${underline("entryFilePath")} not found. Received: ${blue(String(path))}`
);
const configFilePathNotFound = () => () => prettyError(
  `No config file ${underline('("hmr-electron.config.ts")')} found.`
);
const fileNotFound = (file, path) => prettyError(`${underline(file)} not found. Received: ${blue(String(path))}`);
const viteConfigFileNotFound = (cwd) => () => prettyError(
  `Vite config file for main process in "${cwd}" ${underline("NOT")} found.`
);
function prettyError(msg) {
  return new Error(red(`
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
dbg("Hello from the debug side!");

function makeConfigProps(props) {
  props.cwd ||= process.cwd();
  props.electronEntryFilePath = resolve(props.electronEntryFilePath);
  props.srcPath = props.srcPath ? resolve(props.srcPath) : join(props.cwd, "src");
  props.mainPath = props.mainPath ? resolve(props.mainPath) : join(props.srcPath, "main");
  props.rendererPath = props.rendererPath ? resolve(props.rendererPath) : join(props.srcPath, "renderer");
  props.devOutputPath = props.devOutputPath ? resolve(props.devOutputPath) : join(props.cwd, "build");
  props.preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  if (props.preloadFilePath) {
    props.preloadSourceMapFilePath = props.preloadSourceMapFilePath ? resolve(props.preloadSourceMapFilePath) : join(props.devOutputPath, "preload.js.map");
  }
  props.rendererTSconfigPath = props.rendererTSconfigPath ? resolve(props.rendererTSconfigPath) : join(props.rendererPath, "tsconfig.json");
  props.mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(props.mainPath, "tsconfig.json");
  props.nodeModulesPath = props.nodeModulesPath ? resolve(props.nodeModulesPath) : join(props.cwd, "./node_modules");
  props.viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : join(props.cwd, "vite.config.ts");
  props.packageJsonPath = props.packageJsonPath ? resolve(props.packageJsonPath) : join(props.cwd, "package.json");
  props.baseTSconfigPath = props.baseTSconfigPath ? resolve(props.baseTSconfigPath) : join(props.cwd, "tsconfig.json");
  props.buildOutputPath = props.buildOutputPath ? resolve(props.buildOutputPath) : join(props.cwd, "build");
  props.buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(props.buildOutputPath, "renderer");
  props.hmrElectronPath = props.hmrElectronPath ? resolve(props.hmrElectronPath) : join(props.nodeModulesPath, "hmr-electron");
  props.buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(props.buildOutputPath, "main");
  props.esbuildConfig ||= {};
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
    console.log("Resolved config props:", props);
    process.exit();
  }
  dbg("Resolved config props:", props);
  return props;
}
const except = [
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "devOutputPath",
  "esbuildConfig"
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

async function readConfigFile(filePath) {
  if (!filePath || !existsSync(filePath))
    throw new Error(`There must be a config file! Received: "${filePath}"`);
  let filenameChanged = false;
  try {
    if (tsExtensions.includes(extname(filePath))) {
      console.log(blue("Transpiling config file!"));
      const buildResult = await build({
        entryPoints: [filePath],
        format: "esm",
        write: false,
        color: true
      });
      const [outputFile] = buildResult.outputFiles;
      if (!outputFile)
        throw prettyError(
          `Output for transpiling ts -> js on 'readConfigFile()' not present! ${stringifyJson(buildResult)}`
        );
      const { text } = outputFile;
      console.log(green(`Text result from readConfigFile:

${bold(text)}`));
      filePath = makeTempFileWithData(".mjs", text);
      filenameChanged = true;
      console.log(blue("Done transpiling config file!"));
    }
    const { default: config } = await import(filePath);
    console.log(green(`Config = ${stringifyJson(config)}`));
    if (!config)
      throw prettyError("Config file is required!");
    if (!config.electronEntryFilePath)
      throw prettyError("config.electronEntryFilePath is required!");
    return config;
  } catch (error) {
    throw prettyError(String(error));
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
      bgGreen(white(`Using preload file: "${props.preloadFilePath}"`))
    );
  }
  try {
    const buildResult = await build({
      external: await findExternals(props),
      incremental: !props.isBuild,
      tsconfig: tsconfigPath,
      sourcesContent: false,
      treeShaking: true,
      logLevel: "info",
      platform: "node",
      target: "esnext",
      sourcemap: true,
      metafile: true,
      minify: false,
      bundle: false,
      format: "cjs",
      logLimit: 10,
      color: true,
      entryPoints,
      ...props.esbuildConfig,
      watch: !props.isBuild ? {
        onRebuild: async (error) => {
          if (error)
            onError(transformErrors(error));
          else {
            ++count;
            onBuildComplete(props.buildOutputPath, count);
          }
        }
      } : false
    });
    ++count;
    console.log("Build result:", buildResult);
    if (buildResult.metafile) {
      const metafile = await analyzeMetafile(buildResult.metafile, {
        verbose: true
      });
      console.log("Esbuild build result metafile:\n\n", metafile);
    }
    onBuildComplete(props.buildOutputPath, count);
  } catch (error) {
    if (isBuildFailure(error))
      onError(transformErrors(error));
    else
      console.error(error);
  }
}
async function findExternals(props) {
  if (!existsSync(props.packageJsonPath))
    throw new Error(bgRed(white(`Could not find a valid package.json`)));
  const keys = ["dependencies", "devDependencies", "peerDependencies"];
  const pkg = await import(props.packageJsonPath);
  const externals = /* @__PURE__ */ new Set();
  keys.forEach((key) => {
    const obj = pkg[key] ?? {};
    Object.keys(obj).forEach((name) => externals.add(name));
  });
  if (existsSync(props.nodeModulesPath)) {
    const modules = await readdir(props.nodeModulesPath);
    modules.forEach((mod) => externals.add(mod));
  }
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

function formatCompileError(err) {
  if (!err.location)
    return err.message;
  const border = red(borderY);
  const categoryMessage = red("[ERROR]");
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
  const errorMessage = `Found ${errors.length} errors. Watching for file changes.`;
  const messages = errors.map((e) => formatCompileError(e));
  let diagnosticDetail = "";
  messages.forEach((msg, index, { length }) => {
    diagnosticDetail += msg.split(newLine).map((i) => "  " + i).join(newLine);
    if (index + 1 !== length)
      diagnosticDetail += newLine;
  });
  const result = `${borderY}
${magenta(
    `${consoleMessagePrefix} Some typescript compilation errors occurred:`
  )}
${diagnosticDetail}
${magenta(errorMessage)}`;
  return result;
}
const newLine = "\n";

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
async function runElectron({ electronEntryFile, silent = false }) {
  stopElectronFns.forEach((stopElectron) => stopElectron());
  const electronProcess = spawn("electron", ["--color", electronEntryFile]).on(
    "exit",
    (code) => {
      if (!exitBecauseOfUserCode)
        throw new Error(gray(`Electron exited with code ${code}.`));
      exitBecauseOfUserCode = true;
    }
  );
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
async function promptToRerunElectron(electronEntryFile, count) {
  stopPromptToRunElectron();
  console.log(finishBuildMessage);
  if (count > 1) {
    const [readAnswer, stopPrompt] = prompt(
      `[x${count}] Need to rerun Electron?`
    );
    stopPromptToRunElectron = stopPrompt;
    if (await readAnswer())
      await runElectron({ electronEntryFile });
  } else {
    await runElectron({ electronEntryFile });
  }
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
      for (const { file } of ctx.modules) {
        if (!file)
          continue;
        const path = basename(srcPath);
        console.log(bgBlue(white("[VITE]")), yellow("hmr update"), gray(path));
      }
      return ctx.modules;
    }
  };
  return plugin;
}

async function startViteServer(config) {
  const server = await createServer({
    plugins: [
      electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
      LoggerPlugin(config.cwd)
    ],
    configFile: config.viteConfigPath,
    logLevel: "info"
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (address && typeof address === "object") {
    const { port } = address;
    console.log(
      bold(
        green(
          `${bgGreen(white("[VITE]"))} Dev server running at port ${port}.`
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
  dbg(`Original args = ${prettyPrintStringArray(args)}`);
  let indexToSliceFrom = 0;
  for (const arg of reversedArgs) {
    dbg({ arg, nameToMatch: name, index: arg.lastIndexOf(name) });
    const indexOfThisPkgCommand = arg.lastIndexOf(name);
    if (indexOfThisPkgCommand === -1)
      continue;
    ++indexToSliceFrom;
    break;
  }
  const argsToUse = args.slice(indexToSliceFrom);
  dbg(
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
  console.log("argsAsObj =", stringifyJson(obj));
  return obj;
}
function printHelpMsg() {
  console.log(`${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage")}: ${name} [command] [options]

  You must have an ${blue("hmr-electron.config.(ts|js|json)")}
  file at the root of your package.

${bold("Commands:")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}
const greenEqual = green("=");

parseCliArgs();
