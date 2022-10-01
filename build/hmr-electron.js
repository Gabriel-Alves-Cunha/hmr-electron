import { join, resolve, extname, basename } from 'node:path';
import { log, dir, error, warn } from 'node:console';
import { existsSync, writeFileSync, rmSync, readdirSync, createReadStream } from 'node:fs';
import { build, analyzeMetafile } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
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

const hmrElectronConsoleMessagePrefix = bgYellow(
  bold(black("[hmr-electron]"))
);
const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));
const finishBuildMessage = hmrElectronConsoleMessagePrefix + green(
  " Build finished."
);
function entryFilePathNotFound(path) {
  return () => throwPrettyError(
    `${underline("entryFilePath")} not found. Received: ${blue(path)}`
  );
}
function configFilePathNotFound() {
  throwPrettyError(
    `No config file (${underline("'hmr-electron.config.ts'")}) found.`
  );
}
function fileNotFound(file, path) {
  return `File ${underline(green(`"${file}"`))} not found. Received: ${blue(path)}`;
}
function viteConfigFileNotFound(cwd) {
  return () => throwPrettyError(
    `Vite config file for main process in "${cwd}" ${underline("NOT")} found.`
  );
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
    dir(args, {
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
    log(...args);
}
logDbg("Hello from the debug side!");

function makeConfigProps(props) {
  const cwd = props.cwd || process.cwd();
  const electronEntryFilePath = resolve(props.electronEntryFilePath);
  const srcPath = props.srcPath ? resolve(props.srcPath) : join(cwd, "src");
  const mainPath = props.mainPath ? resolve(props.mainPath) : join(srcPath, main);
  const rendererPath = props.rendererPath ? resolve(props.rendererPath) : join(srcPath, "renderer");
  const devOutputPath = props.devOutputPath ? resolve(props.devOutputPath) : join(cwd, "dev-build");
  const preloadFilePath = props.preloadFilePath ? resolve(props.preloadFilePath) : void 0;
  let preloadSourceMapFilePath;
  if (props.preloadFilePath) {
    preloadSourceMapFilePath = props.preloadSourceMapFilePath ? resolve(props.preloadSourceMapFilePath) : join(devOutputPath, main, "preload.cjs.map");
  }
  const rendererTSconfigPath = props.rendererTSconfigPath ? resolve(props.rendererTSconfigPath) : join(rendererPath, tsconfigJson);
  const mainTSconfigPath = props.mainTSconfigPath ? resolve(props.mainTSconfigPath) : join(mainPath, tsconfigJson);
  const nodeModulesPath = props.nodeModulesPath ? resolve(props.nodeModulesPath) : join(cwd, "./node_modules");
  const viteConfigPath = props.viteConfigPath ? resolve(props.viteConfigPath) : join(cwd, "vite.config.ts");
  const packageJsonPath = props.packageJsonPath ? resolve(props.packageJsonPath) : join(cwd, "package.json");
  const baseTSconfigPath = props.baseTSconfigPath ? resolve(props.baseTSconfigPath) : join(cwd, tsconfigJson);
  const buildOutputPath = props.buildOutputPath ? resolve(props.buildOutputPath) : join(cwd, "build");
  const buildRendererOutputPath = props.buildRendererOutputPath ? resolve(props.buildRendererOutputPath) : join(buildOutputPath, "renderer");
  const hmrElectronPath = props.hmrElectronPath ? resolve(props.hmrElectronPath) : join(nodeModulesPath, "hmr-electron");
  const buildMainOutputPath = props.buildMainOutputPath ? resolve(props.buildMainOutputPath) : join(buildOutputPath, main);
  const esbuildConfig = props.esbuildConfig || {};
  const electronOptions = props.electronOptions || [];
  const devBuildElectronEntryFilePath = join(devOutputPath, main, "index.cjs");
  const devBuildRendererOutputPath = join(devOutputPath, "renderer");
  const electronEnviromentVariables = props.electronEnviromentVariables || {};
  const newProps = {
    devBuildElectronEntryFilePath,
    electronEnviromentVariables,
    devBuildRendererOutputPath,
    preloadSourceMapFilePath,
    buildRendererOutputPath,
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
const tsconfigJson = "tsconfig.json";
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

const require2 = createRequire(import.meta.url);

async function readConfigFile(filePath) {
  if (!filePath || !existsSync(filePath))
    throwPrettyError(`There must be a config file! Received: "${filePath}"`);
  let filenameChanged = false;
  try {
    if (tsExtensions.includes(extname(filePath))) {
      const buildResult = await build({
        minifyIdentifiers: false,
        minifyWhitespace: false,
        entryPoints: [filePath],
        minifySyntax: false,
        treeShaking: true,
        logLevel: "debug",
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
          `Output for transpiling to '.js' on 'readConfigFile()' not present! ${stringifyJson(buildResult)}`
        );
      const { text } = outputFile;
      logDbg(green(`Text result from readConfigFile():
${bold(text)}
`));
      filePath = makeTempFileWithData(".js", text);
      filenameChanged = true;
    }
    const { default: userConfig } = require2(filePath);
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
  await rm(config.buildOutputPath, { recursive: true, force: true });
  await rm(config.devOutputPath, { recursive: true, force: true });
}

function getRelativePreloadFilePath(path, cwd) {
  return path.substring(cwd.length);
}

async function runEsbuildForMainProcess(props, onError, onBuildComplete) {
  const tsconfigPath = join(props.mainPath, "tsconfig.json");
  const entryPoints = [props.electronEntryFilePath];
  let count = 0;
  if (props.preloadFilePath) {
    entryPoints.push(props.preloadFilePath);
    log(
      `	Using preload file: "${getRelativePreloadFilePath(props.preloadFilePath, props.cwd)}"
`
    );
  }
  try {
    await cleanCache(props);
    const buildResult = await build({
      outdir: props.isBuild ? props.buildMainOutputPath : join(props.devOutputPath, "main"),
      external: await findExternals(props),
      minify: props.isBuild ? true : false,
      outExtension: { ".js": ".cjs" },
      incremental: !props.isBuild,
      tsconfig: tsconfigPath,
      sourcesContent: false,
      treeShaking: true,
      logLevel: "debug",
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
      ...props.esbuildConfig,
      watch: props.isBuild ? false : {
        onRebuild: async (error2) => {
          error2 ? onError(transformErrors(error2)) : onBuildComplete(props, count++);
        }
      }
    });
    ++count;
    dbg("Build result:", buildResult);
    if (buildResult.metafile) {
      const metafile = await analyzeMetafile(buildResult.metafile, {
        verbose: true
      });
      log("Esbuild build result metafile:\n", metafile);
    }
    onBuildComplete(props, count);
  } catch (err) {
    isBuildFailure(err) ? onError(transformErrors(err)) : error(err);
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
function transformErrors(error2) {
  return error2.errors.map((e) => ({
    location: e.location,
    message: e.text
  }));
}
function isBuildFailure(err) {
  return err && err.errors && Array.isArray(err.errors);
}
const dependenciesKeys = [
  "peerDependencies",
  "devDependencies",
  "dependencies"
];
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
  const pathMessage = `file: ${cyan(err.location.file)}
line: ${yellow(err.location.line)}
column: ${yellow(err.location.column)}
`;
  const code = `${gray(err.location.line)} ${err.location.lineText}
${" ".repeat(err.location.column + `${err.location.line}`.length + 1 + 1)}
${red("~".repeat(err.location.length))} ${" ".repeat(
    err.location.lineText.length - err.location.column - err.location.length
  )}`;
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
${hmrElectronConsoleMessagePrefix} ${magenta("Some typescript compilation errors occurred:")}

${diagnosticDetail}

${magenta(errorMessage)}
${borderY}`;
  return result;
}

async function runViteBuild(config) {
  const buildResult = await build$1({
    esbuild: {
      minifyIdentifiers: false,
      minifyWhitespace: false,
      sourcesContent: false,
      minifySyntax: false,
      platform: "browser",
      treeShaking: true,
      logLevel: "debug",
      target: "esnext",
      sourcemap: true,
      charset: "utf8",
      format: "esm",
      logLimit: 10,
      color: true,
      supported
    },
    logLevel: "info",
    build: {
      outDir: config.buildRendererOutputPath,
      rollupOptions: {
        preserveEntrySignatures: "strict",
        strictDeprecations: true,
        output: {
          generatedCode: {
            objectShorthand: true,
            constBindings: true,
            preset: "es2015"
          },
          format: "esm"
        }
      },
      chunkSizeWarningLimit: 1e3,
      reportCompressedSize: false,
      emptyOutDir: true,
      sourcemap: false,
      target: "esnext",
      minify: true
    },
    configFile: config.viteConfigPath
  });
  dbg({ buildResult });
}

const removeJunkTransformOptions = {
  decodeStrings: false,
  transform(chunk, _encoding, doneCb) {
    const source = chunk.toString();
    if (source.includes(errorThatAlwaysAppear, 49) || junkRegex_1.test(source) || junkRegex_2.test(source) || junkRegex_3.test(source))
      return;
    doneCb(void 0, chunk);
  }
};
const junkRegex_1 = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;
const errorThatAlwaysAppear = "unknown libva error, driver_name = (null)";

const stopElectronFns = [];
let exitBecauseOfUserCode = false;
async function runElectron({
  electronEnviromentVariables,
  devBuildElectronEntryFilePath,
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
      "--trace-warnings",
      "--inspect"
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
    devBuildElectronEntryFilePath
  ], { env: electronEnviromentVariables }).on("exit", (code, signal) => {
    if (!exitBecauseOfUserCode)
      throwPrettyError(
        `Electron exited with code: ${code}, signal: ${signal}.`
      );
    exitBecauseOfUserCode = true;
  }).on("close", (code, signal) => {
    log(
      getPrettyDate(),
      gray(
        `Process closed with code: ${code}, signal: ${signal}.`
      )
    );
    process.exit(code ?? void 0);
  }).on("error", (err) => {
    throwPrettyError(
      `Error from child_process running Electron: ${err.message}`
    );
  });
  electronProcess.stdout.on("data", (data) => {
    log(getPrettyDate(), data);
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
  const questionAndPrompt = `${green("?")} ${question} ${gray("(Y/n)")} `;
  const readline = createInterface({
    output: process.stdout,
    input: process.stdin
  });
  let answerResolve = () => {
  };
  const answerPromise = new Promise((resolve) => {
    answerResolve = resolve;
  });
  readline.question(questionAndPrompt, (answer) => {
    answerResolve(yes.includes(answer));
    readline.close();
  });
  return [() => answerPromise, () => {
    log();
    readline.close();
  }];
}
const yes = ["Y", "y", "\n", "\r", "\r\n"];

async function runBuild(config) {
  findPathOrExit(
    [config.viteConfigPath, ...defaultPathsForViteConfigFile],
    viteConfigFileNotFound(config.cwd)
  );
  findPathOrExit(
    [config.electronEntryFilePath, ...entryFileDefaultPlaces],
    entryFilePathNotFound(config.electronEntryFilePath)
  );
  await runEsbuildForMainProcess(
    { ...config, isBuild: true },
    diagnoseErrors,
    () => {
    }
  );
  await runViteBuild(config);
}
let stopPromptToRunElectron = () => {
};
async function promptToRerunElectron(config, count) {
  stopPromptToRunElectron();
  log(getPrettyDate(), finishBuildMessage);
  if (count > 1) {
    const [readAnswer, stopPrompt] = prompt(
      `${getPrettyDate()} ${bgYellow(black(bold(`[${count}x]`)))} ${needToRerunElectron}`
    );
    stopPromptToRunElectron = stopPrompt;
    if (await readAnswer())
      await runElectron(config);
  } else {
    await runElectron(config);
  }
}
const needToRerunElectron = green("Need to rerun Electron?");

function electronPreloadSourceMapVitePlugin(preloadSourceMapFilePath) {
  const plugin = {
    name: "electron-preload-sourcemap",
    configureServer(server) {
      if (!preloadSourceMapFilePath)
        return warn(yellow("No preloadSourceMapFilePath."));
      else
        log("preloadSourceMapFilePath =", preloadSourceMapFilePath);
      server.middlewares.use((req, res, next) => {
        if (req.originalUrl && preloadSourceMapFilePath.includes(req.originalUrl)) {
          log("Using preload map...");
          createReadStream(preloadSourceMapFilePath).pipe(res);
          return;
        } else
          log("Not using preload map.", req.originalUrl);
        return next();
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
        log(
          viteConsoleMessagePrefix,
          getPrettyDate(),
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
      minifyIdentifiers: false,
      minifyWhitespace: false,
      sourcesContent: false,
      minifySyntax: false,
      platform: "browser",
      treeShaking: true,
      logLevel: "debug",
      target: "esnext",
      sourcemap: true,
      charset: "utf8",
      format: "esm",
      logLimit: 10,
      color: true,
      supported
    },
    plugins: [
      electronPreloadSourceMapVitePlugin(config.preloadSourceMapFilePath),
      LoggerPlugin(config.srcPath)
    ],
    logLevel: "info",
    build: {
      outDir: config.devBuildRendererOutputPath,
      rollupOptions: {
        output: {
          generatedCode: {
            objectShorthand: true,
            constBindings: true,
            preset: "es2015"
          }
        }
      }
    },
    configFile: config.viteConfigPath
  });
  logDbg("Vite server moduleGraph =", stringifyJson(server.moduleGraph));
  logDbg("Vite server config =", stringifyJson(server.config));
  await server.listen();
  const addressInfo = server.httpServer?.address();
  if (addressInfo && typeof addressInfo === "object") {
    const { address, port } = addressInfo;
    log(
      getPrettyDate(),
      viteConsoleMessagePrefix,
      bold(
        green(
          ` Dev server running at address ${underline(`http://${address}:${port}`)}.`
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
  log(
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
