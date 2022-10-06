import { join, resolve, extname } from 'node:path';
import { log, error } from 'node:console';
import { existsSync, writeFileSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { build } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { rm } from 'node:fs/promises';
import { build as build$1, createServer } from 'vite';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { createInterface } from 'node:readline';

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
        `[${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getMilliseconds(), 3)}]`
      )
    )
  );
}
function pad(num, padding = 2) {
  return num.toString().padStart(padding, "0");
}

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
  return `File ${underline(green(`"${file}"`))} not found. Received: ${blue(path)}`;
}
function throwPrettyError(msg) {
  throw new Error(
    red(`
${borderY}
${getPrettyDate()} ${msg}
${borderY}
`)
  );
}
function prettyPrintStringArray(arr) {
  const arrayItems = arr.map((item) => green(`"${item}"`)).join(", ");
  return `[ ${arrayItems} ]`;
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

function stringifyJson(obj) {
  return JSON.stringify(obj, void 0, 2);
}
const logDebug = process.env.DEBUG?.includes("hmr-electron") ?? false;
function logDbg(...args) {
  logDebug && log(...args);
}
logDbg("Hello from the debug side!");

function makeConfigProps(props) {
  const {
    electronOptions = [
      "--enable-source-maps",
      "--node-memory-debug",
      "--trace-warnings",
      "--trace-uncaught",
      "--trace-warnings",
      "--inspect"
    ],
    electronEnviromentVariables = {},
    cwd = process.cwd(),
    esbuildConfig = {}
  } = props;
  Object.assign(electronEnviromentVariables, process.env, { FORCE_COLOR: "2" });
  const electronEsbuildExternalPackages = props.electronEsbuildExternalPackages ? props.electronEsbuildExternalPackages.concat(allBuiltinModules) : allBuiltinModules;
  const srcPath = props.srcPath ? resolve(props.srcPath) : join(cwd, "src");
  const mainPath = props.mainPath ? resolve(props.mainPath) : join(srcPath, main);
  const rendererPath = props.rendererPath ? resolve(props.rendererPath) : join(srcPath, "renderer");
  const devOutputPath = props.devOutputPath ? resolve(props.devOutputPath) : join(cwd, "dev-build");
  const devBuildMainOutputPath = props.devBuildMainOutputPath ? resolve(props.devBuildMainOutputPath) : join(devOutputPath, main);
  const devBuildRendererOutputPath = join(devOutputPath, "renderer");
  const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath ? resolve(props.devBuildElectronEntryFilePath) : join(devBuildMainOutputPath, "index.cjs");
  const preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  let preloadSourceMapFilePath;
  if (props.preloadFilePath) {
    preloadSourceMapFilePath = props.preloadSourceMapFilePath ? resolve(props.preloadSourceMapFilePath) : join(devOutputPath, main, "preload.cjs.map");
  }
  const rendererTSconfigPath = props.rendererTSconfigPath ? resolve(props.rendererTSconfigPath) : join(rendererPath, tsconfigJson);
  const mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(mainPath, tsconfigJson);
  const baseTSconfigPath = props.baseTSconfigPath ? resolve(props.baseTSconfigPath) : join(cwd, tsconfigJson);
  const nodeModulesPath = props.nodeModulesPath ? resolve(props.nodeModulesPath) : join(cwd, "./node_modules");
  const viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : join(cwd, "vite.config.ts");
  const packageJsonPath = props.packageJsonPath ? resolve(props.packageJsonPath) : join(cwd, "package.json");
  const buildOutputPath = props.buildOutputPath ? resolve(props.buildOutputPath) : join(cwd, "build");
  const buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(buildOutputPath, "renderer");
  const buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(buildOutputPath, main);
  const hmrElectronPath = props.hmrElectronPath ? resolve(props.hmrElectronPath) : join(nodeModulesPath, "hmr-electron");
  const electronEntryFilePath = resolve(props.electronEntryFilePath);
  const newProps = {
    electronEsbuildExternalPackages,
    devBuildElectronEntryFilePath,
    electronEnviromentVariables,
    devBuildRendererOutputPath,
    preloadSourceMapFilePath,
    buildRendererOutputPath,
    devBuildMainOutputPath,
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
    if (!key || !filePath || Array.isArray(filePath) || typeof filePath === "object" || except.includes(key))
      return;
    if (!existsSync(filePath)) {
      error(fileNotFound(key, filePath));
      exit = true;
    }
  });
  if (exit) {
    log("Resolved config props:", stringifyJson(props));
    throwPrettyError("Resolve the errors above and try again.");
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
const builtinModulesWithNode = builtinModules.map((mod) => `node:${mod}`);
const allBuiltinModules = builtinModulesWithNode.concat(builtinModules);
const tsconfigJson = "tsconfig.json";
const main = "main";

function hmrElectronLog(...args) {
  log(
    getPrettyDate(),
    hmrElectronConsoleMessagePrefix,
    ...args
  );
}
function viteLog(...args) {
  log(
    getPrettyDate(),
    viteConsoleMessagePrefix,
    ...args
  );
}

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
  !existsSync(filePath) && throwPrettyError(`There must be a config file! Received: "${filePath}"`);
  let filenameChanged = false;
  try {
    if (tsExtensions.includes(extname(filePath))) {
      const buildResult = await build({
        minifyIdentifiers: false,
        minifyWhitespace: false,
        entryPoints: [filePath],
        minifySyntax: false,
        treeShaking: true,
        sourcemap: false,
        logLevel: "info",
        target: "esnext",
        platform: "node",
        charset: "utf8",
        format: "esm",
        logLimit: 10,
        write: false,
        color: true
      });
      const [outputFile] = buildResult.outputFiles;
      if (!outputFile)
        throwPrettyError(
          `Output for transpiling to '.js' on 'readConfigFile()' not present! ${stringifyJson(buildResult)}`
        );
      const { text } = outputFile;
      logDbg(green(`Text result from readConfigFile():
${bold(text)}
`));
      filePath = makeTempFileWithData(".mjs", text);
      filenameChanged = true;
    }
    const { default: userConfig } = await import(filePath);
    logDbg(green(`User config = ${stringifyJson(userConfig)}`));
    if (!userConfig)
      throwPrettyError("Config file is required!");
    if (!userConfig.electronEntryFilePath)
      throwPrettyError("config.electronEntryFilePath is required!");
    return userConfig;
  } catch (err) {
    return throwPrettyError(err);
  } finally {
    if (filenameChanged)
      rmSync(filePath);
  }
}
const tsExtensions = [".ts", ".mts", ".cts"];

async function cleanCache(config) {
  await Promise.all([
    rm(config.buildOutputPath, options$1),
    rm(config.devOutputPath, options$1)
  ]);
}
const options$1 = { recursive: true, force: true };

function ignoreDirectoriesAndFilesPlugin(regexOfDirs) {
  const plugin = {
    name: "ignore-directories-and-files",
    setup(build) {
      build.onResolve(
        options,
        (args) => ({ path: args.path, namespace })
      );
      regexOfDirs.forEach(
        (regex) => build.onResolve({ filter: regex }, (args) => {
          if (args.path.match(regex)) {
            hmrElectronLog(`Ignoring "${args.path}"`);
            return { path: args.path, namespace };
          } else
            return { path: args.path };
        })
      );
      build.onLoad(options, () => ({
        contents: emptyString
      }));
    }
  };
  return plugin;
}
const regexForEverything = /.*/;
const namespace = "ignore";
const options = { filter: regexForEverything, namespace };
const emptyString = "";

function getRelativeFilePath(path, cwd) {
  return path.substring(cwd.length);
}

async function runEsbuildForMainProcess(props, onError, onBuildComplete) {
  const entryPoints = [props.electronEntryFilePath];
  if (props.preloadFilePath) {
    entryPoints.push(props.preloadFilePath);
    log(`
	Using preload file: "${getRelativeFilePath(props.preloadFilePath, props.cwd)}"
`);
  }
  try {
    const buildResult = await build({
      plugins: [
        ignoreDirectoriesAndFilesPlugin([
          new RegExp(props.devBuildMainOutputPath),
          new RegExp(props.buildMainOutputPath),
          /node_modules/
        ])
      ],
      outdir: props.isBuild ? props.buildMainOutputPath : props.devBuildMainOutputPath,
      external: props.electronEsbuildExternalPackages,
      tsconfig: props.mainTSconfigPath,
      outExtension: { ".js": ".cjs" },
      minify: props.isBuild,
      sourcesContent: false,
      incremental: false,
      treeShaking: true,
      logLevel: "info",
      platform: "node",
      target: "esnext",
      charset: "utf8",
      sourcemap: true,
      metafile: true,
      format: "cjs",
      bundle: true,
      logLimit: 10,
      color: true,
      entryPoints,
      supported,
      watch: props.isBuild ? false : {
        onRebuild: async (error2, result) => {
          if (result?.outputFiles)
            log("Esbuild build outputFiles:\n", result.outputFiles);
          if (error2)
            return onError(transformErrors(error2));
          onBuildComplete(props, true);
        }
      },
      ...props.esbuildConfig
    });
    if (buildResult.outputFiles)
      log("Esbuild build outputFiles:\n", buildResult.outputFiles);
    onBuildComplete(props, false);
  } catch (err) {
    isBuildFailure(err) ? onError(transformErrors(err)) : error(err);
  }
}
function transformErrors(error2) {
  return error2.errors.map((e) => ({
    location: e.location,
    message: e.text
  }));
}
function isBuildFailure(err) {
  return err && err.errors && Array.isArray(err.errors);
}
const supported = {
  "arbitrary-module-namespace-names": true,
  "regexp-sticky-and-unicode-flags": true,
  "regexp-unicode-property-escapes": true,
  "typeof-exotic-object-is-object": true,
  "class-private-static-accessor": true,
  "regexp-lookbehind-assertions": true,
  "class-private-static-method": true,
  "regexp-named-capture-groups": true,
  "class-private-static-field": true,
  "class-private-brand-check": true,
  "node-colon-prefix-require": true,
  "node-colon-prefix-import": true,
  "class-private-accessor": true,
  "optional-catch-binding": true,
  "class-private-method": true,
  "regexp-match-indices": true,
  "class-private-field": true,
  "nested-rest-binding": true,
  "class-static-blocks": true,
  "regexp-dot-all-flag": true,
  "class-static-field": true,
  "logical-assignment": true,
  "nullish-coalescing": true,
  "object-rest-spread": true,
  "exponent-operator": true,
  "import-assertions": true,
  "object-extensions": true,
  "default-argument": true,
  "object-accessors": true,
  "template-literal": true,
  "async-generator": true,
  "top-level-await": true,
  "unicode-escapes": true,
  "export-star-as": true,
  "optional-chain": true,
  "dynamic-import": true,
  "const-and-let": true,
  "rest-argument": true,
  "array-spread": true,
  destructuring: true,
  "import-meta": true,
  "async-await": true,
  "class-field": true,
  "new-target": true,
  "for-await": true,
  generator: true,
  "for-of": true,
  hashbang: true,
  bigint: true,
  class: true,
  arrow: true
};

const categoryMessage = red("[ERROR]");
const border = red(borderY);
function formatCompileError(err) {
  if (!err.location)
    return err.message;
  const pathMessage = `file: ${cyan(`"${err.location.file}"`)}
line: ${yellow(err.location.line)}
column: ${yellow(err.location.column)}
`;
  const code = `${gray(err.location.line + " |")}  ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 4)}${red("~".repeat(err.location.length))}`;
  return `${getPrettyDate()} ${categoryMessage}
${border}
${pathMessage}
${err.message}

${code}

${border}`;
}

function diagnoseErrors(errors) {
  error(formatDiagnosticsMessage(errors));
}
function formatDiagnosticsMessage(errors) {
  const errorMessage = `Found ${errors.length} errors. Watching for file changes...`;
  const messages = errors.map((err) => formatCompileError(err));
  let diagnosticsDetails = "";
  messages.forEach((msg, index, { length }) => {
    diagnosticsDetails += `  • ${msg}.`;
    if (index + 1 !== length)
      diagnosticsDetails += "\n";
  });
  return `${magentaBorder}
${hmrElectronConsoleMessagePrefix} ${magenta("Some typescript compilation errors occurred:")}

${diagnosticsDetails}

${magenta(errorMessage)}
${magentaBorder}`;
}
const magentaBorder = magenta(borderY);

async function runViteBuild(config) {
  await build$1({
    build: viteBuildOptions(config, true),
    esbuild: viteESbuildOptions(),
    css: { devSourcemap: true },
    mode: "production",
    logLevel: "info",
    configFile: config.viteConfigPath
  });
}
const viteBuildOptions = (config, isBuild) => ({
  outDir: isBuild ? config.buildRendererOutputPath : config.devBuildRendererOutputPath,
  chunkSizeWarningLimit: 1e3,
  reportCompressedSize: false,
  minify: "esbuild",
  target: "esnext",
  sourcemap: true,
  rollupOptions: {
    preserveEntrySignatures: "strict",
    strictDeprecations: true,
    output: {
      assetFileNames: "assets/[name].[ext]",
      entryFileNames: "[name].[ext]",
      chunkFileNames: "[name].[ext]",
      minifyInternalExports: true,
      sourcemap: true,
      format: "esm",
      generatedCode: {
        objectShorthand: true,
        constBindings: true,
        preset: "es2015"
      }
    }
  }
});
const viteESbuildOptions = (platform = "browser") => ({
  minifyIdentifiers: false,
  minifyWhitespace: false,
  sourcesContent: false,
  minifySyntax: false,
  treeShaking: true,
  logLevel: "info",
  target: "esnext",
  sourcemap: true,
  charset: "utf8",
  format: "esm",
  logLimit: 10,
  color: true,
  supported,
  platform
});

async function runBuild(config) {
  await Promise.all([
    await runEsbuildForMainProcess(
      { ...config, isBuild: true },
      diagnoseErrors,
      () => {
      }
    ),
    await runViteBuild(config)
  ]);
}

const removeJunkLogs = {
  transform(chunk, _encoding, doneCb) {
    const source = chunk.toString();
    if (source.includes(junkError_1, 49) || junkRegex_1.test(source) || junkRegex_2.test(source) || junkRegex_3.test(source))
      return;
    doneCb(null, source);
  }
};
const junkRegex_1 = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;
const junkError_1 = "unknown libva error, driver_name = (null)";

function stopPreviousElectronAndStartANewOne({
  electronEnviromentVariables: env,
  devBuildElectronEntryFilePath,
  electronOptions,
  silent = false,
  isTest = false
}) {
  logDbg(
    "hmr-electron memory usage:",
    process.memoryUsage(),
    "\nresource usage:",
    process.resourceUsage()
  );
  killPreviousElectronProcesses();
  const electronProcess = spawn(
    "electron",
    isTest ? [""] : [
      ...electronOptions,
      devBuildElectronEntryFilePath
    ],
    { env }
  ).on("exit", (code, signal) => {
    code !== 0 && throwPrettyError(
      `Electron exited with code: ${code}, signal: ${signal}.`
    );
    process.exitCode = code ?? 0;
  }).on("error", (err) => {
    throwPrettyError(
      `Error from child_process running Electron: ${err.message}`
    );
  }).on("spawn", () => {
    previousElectronProcesses.set(
      electronProcess.pid,
      electronProcess
    );
    hmrElectronLog(
      gray(
        "Electron process has been spawned!"
      )
    );
    logDbg(
      `Electron child process has been spawned with args: ${prettyPrintStringArray(electronProcess.spawnargs)}`
    );
  });
  if (!silent) {
    const removeElectronLoggerJunkOutput = new Transform(
      removeJunkLogs
    );
    const removeElectronLoggerJunkErrors = new Transform(
      removeJunkLogs
    );
    electronProcess.stdout.pipe(removeElectronLoggerJunkOutput).pipe(
      process.stdout
    );
    electronProcess.stderr.pipe(removeElectronLoggerJunkErrors).pipe(
      process.stderr
    );
  }
  return electronProcess;
}
const previousElectronProcesses = /* @__PURE__ */ new Map();
function killPreviousElectronProcesses() {
  previousElectronProcesses.forEach((electronProcess, pid) => {
    if (electronProcess.killed)
      previousElectronProcesses.delete(pid);
    electronProcess.removeAllListeners();
    logDbg(
      "electron child process listeners names:",
      electronProcess.eventNames()
    );
    process.kill(pid, 0);
  });
}

async function askYesNo({ question, yesValues, noValues }) {
  question = `${getPrettyDate()} ${question} ${gray("(Y/n)")} `;
  yesValues = yesValues?.map((v) => v.toLowerCase()) ?? yes;
  noValues = noValues?.map((v) => v.toLowerCase()) ?? no;
  const readline = createInterface({
    output: process.stdout,
    input: process.stdin
  });
  const stopPromptFn = () => readline.close();
  const readAnswerFn = () => new Promise((resolve) => {
    readline.question(question, async (answer) => {
      readline.close();
      const cleaned = answer.trim().toLowerCase();
      if (cleaned === "")
        return resolve(true);
      if (yesValues.includes(cleaned))
        return resolve(true);
      if (noValues.includes(cleaned))
        return resolve(false);
    });
  });
  return [readAnswerFn, stopPromptFn];
}
const yes = ["yes", "y"];
const no = ["no", "n"];

function viteLoggerPlugin(srcPath) {
  const plugin = {
    name: "hmr-logger",
    buildEnd(err) {
      if (err)
        error(getPrettyDate(), viteConsoleMessagePrefix, err);
      log(
        getPrettyDate(),
        hmrElectronConsoleMessagePrefix,
        green("Vite build is complete.")
      );
    },
    handleHotUpdate(ctx) {
      ctx.modules.forEach(({ file }) => {
        if (!file)
          return;
        const path = getRelativeFilePath(file, srcPath);
        viteLog(
          yellow(`HMR update on: ${underline(path)}`)
        );
      });
      return ctx.modules;
    }
  };
  return plugin;
}

async function startViteServer(config) {
  const server = await (await createServer({
    build: viteBuildOptions(config, false),
    esbuild: viteESbuildOptions(),
    css: { devSourcemap: true },
    mode: "development",
    logLevel: "info",
    plugins: [
      viteLoggerPlugin(config.srcPath)
    ],
    configFile: config.viteConfigPath
  })).listen();
  logDbg("Vite server config =", stringifyJson(server.config));
  const { address, port } = server.httpServer.address();
  viteLog(
    bold(
      green(
        `Dev server running at address ${underline(`http://${address}:${port}`)}.`
      )
    )
  );
}

async function runDev(config) {
  startViteServer(config);
  runEsbuildForMainProcess(
    { ...config, isBuild: false },
    diagnoseErrors,
    promptToRerunElectron
  );
}
const prettyCount = (count2) => bgYellow(black(bold(`[${count2}º]`)));
let stopPreviousPromptToRerunElectron = () => {
};
let count = 0;
async function promptToRerunElectron(config, isWatch) {
  stopPreviousPromptToRerunElectron();
  ++count;
  if (!isWatch || count === 1) {
    stopPreviousElectronAndStartANewOne(config);
    return;
  }
  const [readAnswerFn, stopPromptFn] = await askYesNo({
    question: `${prettyCount(count)} ${needToRerunElectron}`
  });
  stopPreviousPromptToRerunElectron = stopPromptFn;
  if (await readAnswerFn()) {
    hmrElectronLog(magenta("Reloading Electron..."));
    stopPreviousElectronAndStartANewOne(config);
  } else
    hmrElectronLog(magenta("Not reloading Electron."));
}
const needToRerunElectron = green("Do you want to rerun Electron?");

const name = "hmr-electron";
const version = "0.0.3";

async function parseCliArgs() {
  const args = argsAsObj(usefullArgs());
  if (Object.keys(args).length === 0)
    return printHelpMsg();
  const configFilePathFromArgs = args["--config-file"];
  const configFilePath = configFilePathFromArgs ? resolve(configFilePathFromArgs) : findPathOrExit(defaultPathsForConfig, configFilePathNotFound);
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
  hmrElectronLog(
    `No commands matched. Args = ${prettyPrintStringArray(process.argv)}`
  );
}
function usefullArgs() {
  const args = process.argv;
  const reversedArgs = args.slice().reverse();
  logDbg(`Original args = ${prettyPrintStringArray(args)}`);
  let indexToSliceFrom = 0;
  for (const arg of reversedArgs) {
    const indexOfThisPkgCommand = arg.lastIndexOf(name);
    if (indexOfThisPkgCommand === -1)
      continue;
    ++indexToSliceFrom;
    break;
  }
  const argsToUse = args.slice(indexToSliceFrom + 1);
  logDbg(`Modified args = ${prettyPrintStringArray(argsToUse)}`);
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
  log(`${bold(blue(name))} version ${version}

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
