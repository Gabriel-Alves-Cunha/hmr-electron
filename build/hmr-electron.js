import { resolve as r, join as c } from "node:path";
import { env as y, exit as $, cwd as Pe, kill as ye, argv as $e } from "node:process";
import { log as m, dir as be, error as b } from "node:console";
import { existsSync as F, readFileSync as Ee, writeFileSync as Fe, rmSync as j } from "node:fs";
import { builtinModules as J } from "node:module";
import { buildSync as xe, build as Oe } from "esbuild";
import { tmpdir as we } from "node:os";
import { spawn as Se } from "node:child_process";
import { Transform as U } from "node:stream";
import { build as Ce, createServer as ke } from "vite";
function oe(e, n) {
  for (const t of e())
    if (F(t))
      return t;
  n();
}
const v = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"], Be = "hmr-electron.config.", B = "vite.config.";
function* Re() {
  for (const e of v)
    yield r(`${Be}${e}`);
}
function* je() {
  for (const e of v)
    yield r(`${B}${e}`);
  for (const e of v)
    yield r("src", `${B}${e}`);
  for (const e of v)
    yield r("src", "renderer", `${B}${e}`);
}
const s = (e, n) => (t) => `\x1B[${e}m${t}\x1B[${n}m`, x = s(4, 24), f = s(1, 22), Me = s(43, 49), Le = s(42, 49), Ae = s(44, 49), M = s(35, 39), L = s(33, 39), O = s(32, 39), _ = s(30, 39), P = s(34, 39), Ne = s(90, 39), _e = s(36, 39), g = s(31, 39), E = "────────────────────────────────────────────────────────────────────────────────";
function w() {
  const e = new Date();
  return Ae(
    f(
      _(
        `[${p(e.getHours())}:${p(e.getMinutes())}:${p(
          e.getSeconds()
        )} ${p(e.getMilliseconds(), 3)}]`
      )
    )
  );
}
const p = (e, n = 2) => e.toString().padStart(n, "0"), Te = Le(f(_("[VITE]"))), ie = Me(
  f(_("[hmr-electron]"))
), De = () => u(
  `No config file (${x("'hmr-electron.config.ts'")}) found.`
), Ie = (e, n) => `File ${x(O(`"${e}"`))} not found. Received: ${P(n)}`, Ve = () => u(
  `Vite config file for main process ${x("NOT")} found.`
);
function u(e) {
  throw e = `
${g(E)}
${w()} ${e}
${g(E)}
`, new Error(e);
}
function We(e) {
  return `[ ${e.map((t) => O(`"${t}"`)).join(", ")} ]`;
}
const d = (...e) => m(w(), ie, ...e), Je = (...e) => m(w(), Te, ...e), h = (e) => JSON.stringify(e, null, 2), re = y.DEBUG?.split(","), Ue = re?.includes("hmr-electron:config-result"), He = re?.includes("hmr-electron"), ze = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: !1,
  sorted: !1,
  colors: !0,
  depth: 10
};
function T(...e) {
  He && m(...e);
}
function D(...e) {
  Ue && be(e, ze);
}
T("Hello from the debug side!");
function qe(e) {
  try {
    const n = Ye(
      Ee(e, { encoding: "utf-8" })
    );
    for (const t of Object.keys(n))
      Object.hasOwn(y, t) ? d(
        `"${t}" is already defined in \`process.env\` and was __NOT__ overwritten!`
      ) : y[t] = n[t];
  } catch (n) {
    d(`Failed to load ${e} ${n.message}`), $(1);
  }
}
function Ye(e) {
  const n = {};
  let t, o = e.replace(/\r\n?/gm, `
`);
  for (; (t = Ge.exec(o)) !== null; ) {
    const i = t[1];
    let a = (t[2] ?? "").trim();
    const l = a[0];
    a = a.replace(/^(['"`])([\s\S]*)\1$/gm, "$2"), l === '"' && (a = a.replace(/\\n/g, `
`).replace(/\\r/g, "\r")), n[i] = a;
  }
  return n;
}
const Ge = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function Qe(e) {
  const {
    electronOptions: n = [
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
    electronEsbuildExternalPackages: t = [],
    viteExternalPackages: o = [],
    esbuildIgnore: i = [],
    esbuildConfig: a = {},
    root: l = Pe()
  } = e;
  qe(c(l, ".env")), y.FORCE_COLOR = "2", t.push(
    ...Ze,
    "electron",
    "esbuild",
    "vite"
  ), i.push(/node_modules/);
  const I = r(e.srcPath ?? "src"), V = e.mainPath ? r(e.mainPath) : c(I, R), S = r(e.devOutputPath ?? "dev-build"), W = e.devBuildMainOutputPath ? r(e.devBuildMainOutputPath) : c(S, R), ue = c(S, H), de = e.devBuildElectronEntryFilePath ? r(e.devBuildElectronEntryFilePath) : c(W, "index.cjs"), fe = e.preloadFilePath ? r(e.preloadFilePath) : void 0, ge = e.mainTSconfigPath ? r(e.mainTSconfigPath) : c(V, et), me = e.viteConfigPath ? r(e.viteConfigPath) : oe(je, Ve), C = r(e.buildOutputPath ?? "build"), he = e.buildRendererOutputPath ? r(e.buildRendererOutputPath) : c(C, H), pe = e.buildMainOutputPath ? r(e.buildMainOutputPath) : c(C, R), ve = r(e.electronEntryFilePath), k = {
    electronEsbuildExternalPackages: t,
    devBuildElectronEntryFilePath: de,
    devBuildRendererOutputPath: ue,
    buildRendererOutputPath: he,
    devBuildMainOutputPath: W,
    electronEntryFilePath: ve,
    viteExternalPackages: o,
    buildMainOutputPath: pe,
    mainTSconfigPath: ge,
    electronOptions: n,
    buildOutputPath: C,
    preloadFilePath: fe,
    viteConfigPath: me,
    devOutputPath: S,
    esbuildConfig: a,
    esbuildIgnore: i,
    mainPath: V,
    srcPath: I,
    root: l
  };
  return Ke(k), D("Resolved config:", h(k)), k;
}
function Ke(e) {
  let n = !1;
  for (const [t, o] of Object.entries(e))
    !(t && o) || typeof o != "string" || Xe.includes(t) || F(o) || (b(Ie(t, o)), n = !0);
  n && (m("Resolved config:", h(e)), u("Resolve the errors above and try again."));
}
const Xe = [
  "devBuildElectronEntryFilePath",
  "devBuildRendererOutputPath",
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "devBuildMainOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "viteConfigPath",
  "devOutputPath"
], Ze = J.map((e) => `node:${e}`).concat(J), et = "tsconfig.json", H = "renderer", R = "main";
function tt() {
  const e = r("hmr-electron.config.ts");
  F(e) && u("There already exists a config file for hmr-electron.");
  try {
    Fe(e, nt);
  } catch (n) {
    throw n;
  }
}
const nt = `import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
async function ot(e) {
  F(e) || u(`There must be a config file! Received: "${e}"`);
  let n = !1, t = "";
  it.some((i) => e.endsWith(i)) && (t = c(we(), "config-file-hmr-electron.mjs"), n = !0, xe({
    minifyIdentifiers: !1,
    minifyWhitespace: !1,
    entryPoints: [e],
    minifySyntax: !1,
    treeShaking: !0,
    sourcemap: !1,
    target: "esnext",
    logLevel: "info",
    platform: "node",
    charset: "utf8",
    format: "esm",
    watch: !1,
    logLimit: 10,
    color: !0,
    write: !0,
    outfile: t
  }));
  const { default: o } = await (n ? import(t) : import(e)).catch(u).finally(() => n && j(t));
  return D(`User config = ${h(o)}`), o || u("Config file is required!"), o.electronEntryFilePath || u("`config.electronEntryFilePath` is required!"), o;
}
const it = [".ts", ".mts", ".cts"];
function z(e) {
  j(e.buildOutputPath, q), j(e.devOutputPath, q);
}
const q = { recursive: !0, force: !0 }, Y = {
  transform(e, n, t) {
    const o = e.toString(), i = null;
    o.includes(ct, 49) || rt.test(o) || st.test(o) || at.test(o) || t(i, o);
  }
}, rt = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/, st = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/, at = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/, ct = "unknown libva error, driver_name = (null)";
function G({
  devBuildElectronEntryFilePath: e,
  electronOptions: n,
  isTest: t = !1
}) {
  lt();
  const o = Se(
    "electron",
    t ? [""] : [...n, e]
  ).on("exit", () => $(0)).on("spawn", () => {
    A.set(
      o.pid,
      o
    ), d("Electron reloaded"), T(
      `Electron child process has been spawned with args: ${We(
        o.spawnargs
      )}`
    );
  }), i = new U(Y), a = new U(Y);
  return o.stdout.pipe(i).pipe(process.stdout), o.stderr.pipe(a).pipe(process.stderr), o;
}
const A = /* @__PURE__ */ new Map();
function lt() {
  for (const [e, n] of A)
    try {
      n.removeAllListeners(), n.on("exit", () => A.delete(e)), ye(e);
    } catch (t) {
      d("Error when killing Electron process:", t);
    }
}
function ut(e) {
  return {
    name: "ignore-directories-and-files",
    setup(t) {
      t.onResolve(Q, ({ path: o }) => ({ path: o, namespace: N }));
      for (const o of e)
        t.onResolve({ filter: o }, ({ path: i }) => i.match(o) ? (d(`Ignoring "${i}"`), { path: i, namespace: N }) : { path: i });
      t.onLoad(Q, () => ({
        contents: ""
      }));
    }
  };
}
const dt = /[\s\S]*/gm, N = "ignore", Q = { filter: dt, namespace: N };
async function se(e, n) {
  const t = [e.electronEntryFilePath];
  e.preloadFilePath && (t.push(e.preloadFilePath), d(
    `Using preload file: "${e.preloadFilePath.substring(e.root.length)}".`
  ));
  try {
    const o = await Oe({
      plugins: [
        ut(e.esbuildIgnore)
      ],
      outdir: e.isBuild ? e.buildMainOutputPath : e.devBuildMainOutputPath,
      external: e.electronEsbuildExternalPackages,
      minifyIdentifiers: e.isBuild,
      tsconfig: e.mainTSconfigPath,
      minifyWhitespace: e.isBuild,
      outExtension: { ".js": ".cjs" },
      minifySyntax: e.isBuild,
      minify: e.isBuild,
      sourcesContent: !1,
      sourcemap: "external",
      legalComments: "none",
      incremental: !1,
      treeShaking: !0,
      logLevel: "info",
      platform: "node",
      target: "esnext",
      charset: "utf8",
      format: "cjs",
      logLimit: 10,
      bundle: !0,
      color: !0,
      entryPoints: t,
      watch: e.isBuild ? !1 : {
        onRebuild(i) {
          if (i)
            return X(i) && (b(i), $(1)), n(K(i));
          G(e);
        }
      },
      ...e.esbuildConfig
    });
    o.errors.length && d(`Esbuild build errors:
`, o.errors), process.on("exit", () => o.stop?.()), e.isBuild || G(e);
  } catch (o) {
    X(o) ? n(K(o)) : (b(o), $(1));
  }
}
const K = (e) => e.errors.map((n) => ({
  location: n.location,
  message: n.text
})), X = (e) => Array.isArray(e?.errors);
async function ft(e) {
  await Ce({
    esbuild: ce("browser", "esm", !0),
    build: ae(e, "esm", !0),
    css: { devSourcemap: !0 },
    mode: "production",
    logLevel: "info",
    configFile: e.viteConfigPath
  });
}
const ae = (e, n, t) => ({
  outDir: t ? e.buildRendererOutputPath : e.devBuildRendererOutputPath,
  sourcemap: t ? !1 : "inline",
  minify: t ? "esbuild" : !1,
  chunkSizeWarningLimit: 1e3,
  reportCompressedSize: !1,
  emptyOutDir: !0,
  target: "esnext",
  rollupOptions: {
    external: e.viteExternalPackages,
    preserveEntrySignatures: "strict",
    strictDeprecations: !0,
    output: {
      sourcemap: t ? !1 : "inline",
      assetFileNames: "assets/[name].[ext]",
      minifyInternalExports: t,
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name].mjs",
      compact: t,
      format: n,
      generatedCode: {
        objectShorthand: !0,
        constBindings: !0,
        preset: "es2015"
      }
    }
  }
}), ce = (e, n, t) => ({
  minifyIdentifiers: t,
  minifyWhitespace: t,
  sourcesContent: !1,
  legalComments: "none",
  sourcemap: "external",
  minifySyntax: t,
  treeShaking: !0,
  target: "esnext",
  logLevel: "info",
  charset: "utf8",
  logLimit: 10,
  color: !0,
  platform: e,
  format: n
}), gt = g("[ERROR]"), Z = g(E);
function mt(e) {
  if (!e.location)
    return e.message;
  const n = `file: ${_e(`"${e.location.file}"`)}
line: ${L(e.location.line)}
column: ${L(e.location.column)}
`, t = `${Ne(`${e.location.line} |`)}  ${e.location.lineText}
${" ".repeat(e.location.column + `${e.location.line}`.length + 4)}${g("~".repeat(e.location.length))}`;
  return `${w()} ${gt}
${Z}
${n}
${e.message}

${t}

${Z}`;
}
const le = (e) => b(ht(e));
function ht(e) {
  const n = `Found ${e.length} errors. Watching for file changes...`, t = e.map((l) => mt(l)), o = t.length;
  let i = "", a = 0;
  for (const l of t)
    i += `  • ${l}.`, a + 1 !== o && (i += `
`);
  return `${ee}
${ie} ${M(
    "Some typescript compilation errors occurred:"
  )}

${i}

${M(n)}
${ee}`;
}
const ee = M(E);
async function pt(e) {
  await Promise.all([
    se({ ...e, isBuild: !0 }, le),
    ft(e)
  ]);
}
async function vt(e) {
  const t = await (await ke({
    esbuild: ce("browser", "esm", !1),
    build: ae(e, "esm", !1),
    css: { devSourcemap: !0 },
    mode: "development",
    logLevel: "info",
    configFile: e.viteConfigPath
  })).listen();
  D("Vite server config =", h(t.config));
  const o = t.httpServer.address();
  Je(
    f(
      O(`Dev server running at address ${x(`http://${o}`)}.`)
    )
  );
}
async function Pt(e) {
  await Promise.all([
    se({ ...e, isBuild: !1 }, le),
    vt(e)
  ]);
}
const te = "hmr-electron", yt = "0.0.9";
async function $t() {
  const e = bt();
  if (Object.keys(e).length === 0)
    return Et();
  if (e.init)
    return tt();
  const n = e["--config-file"], t = n ? r(n) : oe(Re, De), o = await ot(t), i = Qe(o);
  if (e.dev)
    return e["--clean-cache"] && z(i), await Pt(i);
  if (e.build)
    return z(i), await pt(i);
  d(`No commands matched. Args = ${e}`);
}
function bt() {
  const e = {};
  for (const n of $e.slice(2)) {
    const [t, o] = n.split("=");
    !t || (o ? o === "false" ? e[t] = !1 : e[t] = o : e[t] = !0);
  }
  return T("argsAsObj =", h(e)), e;
}
function Et() {
  m(`${f(P(te))} version ${yt}

${L("⚡")} Start developing your Electron + Vite app.

${f("Usage:")} ${te} [command] [options]

  You must have a config file ('${P("hmr-electron.config.ts")}')
  file at the root of your package.

${f("Commands and options:")}
  init  ${P("Make a config file")}
  dev   [--config-file${ne}<configFilePath>] [--clean-cache]
  build [--config-file${ne}<configFilePath>]`);
}
const ne = O("=");
$t();
