import { resolve, join, extname } from 'node:path';
import { env, cwd, exit, kill, argv } from 'node:process';
import { log, dir, error } from 'node:console';
import { existsSync, writeFileSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { build } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { build as build$1, createServer } from 'vite';

function findPathOrExit(defaultPaths, notFoundMessage) {
  for (const defaultPlace of defaultPaths) {
    const fullPath = resolve(defaultPlace);
    if (existsSync(fullPath))
      return fullPath;
  }
  notFoundMessage();
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
  return `File ${underline(green(`"${file}"`))} not found. Received: ${blue(path)}`;
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

function stringifyJson(obj) {
  return JSON.stringify(obj, null, 2);
}
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

function makeConfigProps(props) {
  const {
    electronOptions = [
      "--disallow-code-generation-from-strings",
      "--pending-deprecation",
      "--verify-base-objects",
      "--track-heap-objects",
      "--enable-source-maps",
      "--trace-deprecation",
      "--throw-deprecation",
      "--frozen-intrinsics",
      "--trace-uncaught",
      "--trace-warnings",
      "--trace-sync-io",
      "--deprecation",
      "--v8-options",
      "--trace-tls",
      "--warnings",
      "--inspect"
    ],
    electronEnviromentVariables = {},
    esbuildConfig = {},
    root = cwd()
  } = props;
  Object.assign(electronEnviromentVariables, env, { FORCE_COLOR: "2" });
  const electronEsbuildExternalPackages = (props.electronEsbuildExternalPackages ?? []).concat(
    allBuiltinModules,
    "electron",
    "esbuild",
    "vite"
  );
  const srcPath = resolve(props.srcPath ?? "src");
  const mainPath = props.mainPath ? resolve(props.mainPath) : join(srcPath, main);
  const rendererPath = props.rendererPath ? resolve(props.rendererPath) : join(srcPath, renderer);
  const devOutputPath = resolve(props.devOutputPath ?? "dev-build");
  const devBuildMainOutputPath = props.devBuildMainOutputPath ? resolve(props.devBuildMainOutputPath) : join(devOutputPath, main);
  const devBuildRendererOutputPath = join(devOutputPath, renderer);
  const devBuildElectronEntryFilePath = props.devBuildElectronEntryFilePath ? resolve(props.devBuildElectronEntryFilePath) : join(devBuildMainOutputPath, "index.cjs");
  const preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  const rendererTSconfigPath = props.rendererTSconfigPath ? resolve(props.rendererTSconfigPath) : join(rendererPath, tsconfigJson);
  const mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(mainPath, tsconfigJson);
  const baseTSconfigPath = resolve(props.baseTSconfigPath ?? tsconfigJson);
  const nodeModulesPath = resolve(props.nodeModulesPath ?? "./node_modules");
  const viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : findPathOrExit(defaultPathsForViteConfigFile, viteConfigFileNotFound);
  const packageJsonPath = resolve(props.packageJsonPath ?? "package.json");
  const buildOutputPath = resolve(props.buildOutputPath ?? "build");
  const buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(buildOutputPath, renderer);
  const buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(buildOutputPath, main);
  const hmrElectronPath = props.hmrElectronPath ? resolve(props.hmrElectronPath) : join(nodeModulesPath, "hmr-electron");
  const electronEntryFilePath = resolve(props.electronEntryFilePath);
  const newProps = {
    electronEsbuildExternalPackages,
    devBuildElectronEntryFilePath,
    electronEnviromentVariables,
    devBuildRendererOutputPath,
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
    root
  };
  let doExit = false;
  Object.entries(props).forEach(([key, filePath]) => {
    if (!key || !filePath || typeof filePath !== "string" || except.includes(key))
      return;
    if (!existsSync(filePath)) {
      error(fileNotFound(key, filePath));
      doExit = true;
    }
  });
  if (doExit) {
    log("Resolved config props:", stringifyJson(props));
    throwPrettyError("Resolve the errors above and try again.");
  }
  logConfig("Resolved config props:", newProps);
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
const renderer = "renderer";
const main = "main";

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
  let hasFilenameChanged = false;
  try {
    if (tsExtensions.includes(extname(filePath))) {
      const buildResult = await build({
        minifyIdentifiers: false,
        minifyWhitespace: false,
        entryPoints: [filePath],
        minifySyntax: false,
        treeShaking: true,
        sourcemap: false,
        target: "esnext",
        logLevel: "info",
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
      dbg(`Text result from readConfigFile():
${bold(text)}
`);
      filePath = makeTempFileWithData(".mjs", text);
      hasFilenameChanged = true;
    }
    const { default: userConfig } = await import(filePath);
    logConfig(`User config = ${stringifyJson(userConfig)}`);
    if (!userConfig)
      throwPrettyError("Config file is required!");
    if (!userConfig.electronEntryFilePath)
      throwPrettyError("`config.electronEntryFilePath` is required!");
    return userConfig;
  } catch (e) {
    return throwPrettyError(e);
  } finally {
    if (hasFilenameChanged)
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
  electronEnviromentVariables: env,
  devBuildElectronEntryFilePath,
  electronOptions,
  isTest = false
}) {
  killPreviousElectronProcesses();
  const electron_process = spawn(
    "electron",
    isTest ? [""] : [
      ...electronOptions,
      devBuildElectronEntryFilePath
    ],
    { env }
  ).on("exit", () => exit(0)).on("spawn", () => {
    previousElectronProcesses.set(
      electron_process.pid,
      electron_process
    );
    dbg(
      `Electron child process has been spawned with args: ${prettyPrintStringArray(electron_process.spawnargs)}`
    );
  });
  const removeElectronLoggerJunkOutput = new Transform(removeJunkLogs);
  const removeElectronLoggerJunkErrors = new Transform(removeJunkLogs);
  electron_process.stdout.pipe(removeElectronLoggerJunkOutput).pipe(
    process.stdout
  );
  electron_process.stderr.pipe(removeElectronLoggerJunkErrors).pipe(
    process.stderr
  );
  return electron_process;
}
const previousElectronProcesses = /* @__PURE__ */ new Map();
function killPreviousElectronProcesses() {
  previousElectronProcesses.forEach((electron_process, pid) => {
    try {
      electron_process.removeAllListeners();
      electron_process.on("exit", () => previousElectronProcesses.delete(pid));
      kill(pid);
    } catch (e) {
      hmrElectronLog("Error when killing process:", e);
    }
  });
}

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

async function runEsbuildForMainProcess(props, onError) {
  const entryPoints = [props.electronEntryFilePath];
  if (props.preloadFilePath) {
    entryPoints.push(props.preloadFilePath);
    hmrElectronLog(
      `Using preload file: "${getRelativeFilePath(
        props.preloadFilePath,
        props.root
      )}".`
    );
  }
  try {
    const buildResult = await build({
      plugins: [
        ignoreDirectoriesAndFilesPlugin([
          /node_modules/
        ])
      ],
      outdir: props.isBuild ? props.buildMainOutputPath : props.devBuildMainOutputPath,
      external: props.electronEsbuildExternalPackages,
      tsconfig: props.mainTSconfigPath,
      outExtension: { ".js": ".cjs" },
      minify: props.isBuild,
      sourcesContent: false,
      sourcemap: "external",
      incremental: false,
      treeShaking: true,
      logLevel: "info",
      platform: "node",
      target: "esnext",
      charset: "utf8",
      metafile: true,
      format: "cjs",
      bundle: true,
      logLimit: 10,
      color: true,
      entryPoints,
      supported,
      watch: props.isBuild ? false : {
        onRebuild: async (error2, result) => {
          if (error2)
            return onError(transformErrors(error2));
          if (result?.errors)
            hmrElectronLog("Esbuild build errors:\n", result.errors);
          stopPreviousElectronAndStartANewOne(props);
        }
      },
      ...props.esbuildConfig
    });
    if (buildResult.errors.length)
      hmrElectronLog("Esbuild build errors:\n", buildResult.errors);
    stopPreviousElectronAndStartANewOne(props);
  } catch (err) {
    isBuildFailure(err) ? onError(transformErrors(err)) : error(err);
  }
}
const transformErrors = (error2) => error2.errors.map((e) => ({
  location: e.location,
  message: e.text
}));
const isBuildFailure = (err) => err && err.errors && Array.isArray(err.errors);
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

const diagnoseErrors = (errors) => error(formatDiagnosticsMessage(errors));
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
  const isBuild = true;
  await build$1({
    build: defaultViteBuildOptions(config, isBuild),
    esbuild: defaultViteESbuildOptions(),
    css: { devSourcemap: true },
    mode: "production",
    logLevel: "info",
    configFile: config.viteConfigPath
  });
}
const defaultViteBuildOptions = (config, isBuild) => ({
  outDir: isBuild ? config.buildRendererOutputPath : config.devBuildRendererOutputPath,
  chunkSizeWarningLimit: 1e3,
  reportCompressedSize: false,
  sourcemap: "inline",
  emptyOutDir: true,
  minify: "esbuild",
  target: "esnext",
  rollupOptions: {
    external: config.electronEsbuildExternalPackages,
    preserveEntrySignatures: "strict",
    strictDeprecations: true,
    output: {
      assetFileNames: "assets/[name].[ext]",
      entryFileNames: "[name].[ext]",
      chunkFileNames: "[name].[ext]",
      minifyInternalExports: true,
      sourcemap: "inline",
      format: "esm",
      generatedCode: {
        objectShorthand: true,
        constBindings: true,
        preset: "es2015"
      }
    }
  }
});
const defaultViteESbuildOptions = (platform = "browser") => ({
  minifyIdentifiers: false,
  minifyWhitespace: false,
  sourcesContent: false,
  sourcemap: "external",
  minifySyntax: false,
  treeShaking: true,
  target: "esnext",
  logLevel: "info",
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
      diagnoseErrors
    ),
    await runViteBuild(config)
  ]);
}

function viteLoggerPlugin() {
  const plugin = {
    name: "hmr-logger",
    buildEnd(err) {
      if (err)
        error(getPrettyDate(), viteConsoleMessagePrefix, err);
      viteLog(green("Vite build is complete."));
    }
  };
  return plugin;
}

async function startViteServer(config) {
  const server = await (await createServer({
    build: defaultViteBuildOptions(config, false),
    esbuild: defaultViteESbuildOptions(),
    css: { devSourcemap: true },
    mode: "development",
    logLevel: "info",
    plugins: [
      viteLoggerPlugin()
    ],
    configFile: config.viteConfigPath
  })).listen();
  logConfig("Vite server config =", stringifyJson(server.config));
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
    diagnoseErrors
  );
}

const name = "hmr-electron";
const version = "0.0.4";

async function parseCliArgs() {
  const args = argsAsObj(argv.slice(2));
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
  hmrElectronLog(
    `No commands matched. Args = ${args}`
  );
}
function argsAsObj(args) {
  const obj = {};
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (!key)
      return;
    if (!value)
      obj[key] = true;
    else if (value === "false")
      obj[key] = false;
    else
      obj[key] = value;
  });
  dbg("argsAsObj =", stringifyJson(obj));
  return obj;
}
function printHelpMsg() {
  log(`${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage:")} ${name} [command] [options]

  You must have an ${blue("hmr-electron.config.(ts|js)")}
  file at the root of your package.

${bold("Commands and options:")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}
const greenEqual = green("=");

parseCliArgs();
