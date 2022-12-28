import { resolve as r, join as a } from "node:path";
import { env as $, exit as _, cwd as pe, kill as Pe, on as ve, argv as $e } from "node:process";
import { log as m, dir as ye, error as T } from "node:console";
import { existsSync as b, readFileSync as be, writeFileSync as Ee, rmSync as B } from "node:fs";
import { builtinModules as J } from "node:module";
import { buildSync as Oe, build as xe } from "esbuild";
import { tmpdir as Fe } from "node:os";
import { spawn as we } from "node:child_process";
import { Transform as U } from "node:stream";
import { build as Se, createServer as Ce } from "vite";
function te(e, n) {
  for (const t of e())
    if (b(t))
      return t;
  n();
}
const P = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"], ke = "hmr-electron.config.", C = "vite.config.";
function* Be() {
  for (const e of P)
    yield r(`${ke}${e}`);
}
function* Re() {
  for (const e of P)
    yield r(`${C}${e}`);
  for (const e of P)
    yield r("src", `${C}${e}`);
  for (const e of P)
    yield r("src", "renderer", `${C}${e}`);
}
const s = (e, n) => (t) => `\x1B[${e}m${t}\x1B[${n}m`, E = s(4, 24), f = s(1, 22), je = s(43, 49), Me = s(42, 49), Le = s(44, 49), R = s(35, 39), j = s(33, 39), O = s(32, 39), A = s(30, 39), v = s(34, 39), _e = s(90, 39), Te = s(36, 39), g = s(31, 39), y = "────────────────────────────────────────────────────────────────────────────────";
function x() {
  const e = new Date();
  return Le(
    f(
      A(
        `[${p(e.getHours())}:${p(e.getMinutes())}:${p(
          e.getSeconds()
        )} ${p(e.getMilliseconds(), 3)}]`
      )
    )
  );
}
const p = (e, n = 2) => e.toString().padStart(n, "0"), Ae = Me(f(A("[VITE]"))), ne = je(
  f(A("[hmr-electron]"))
), De = () => u(
  `No config file (${E("'hmr-electron.config.ts'")}) found.`
), Ne = (e, n) => `File ${E(O(`"${e}"`))} not found. Received: ${v(n)}`, Ie = () => u(
  `Vite config file for main process ${E("NOT")} found.`
);
function u(e) {
  throw e = `
${g(y)}
${x()} ${e}
${g(y)}
`, new Error(e);
}
function Ve(e) {
  return `[ ${e.map((t) => O(`"${t}"`)).join(", ")} ]`;
}
const d = (...e) => m(x(), ne, ...e), We = (...e) => m(x(), Ae, ...e), h = (e) => JSON.stringify(e, null, 2), oe = $.DEBUG?.split(","), Je = oe?.includes("hmr-electron:config-result"), Ue = oe?.includes("hmr-electron"), He = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: !1,
  sorted: !1,
  colors: !0,
  depth: 10
}, D = (...e) => Ue && m(...e), N = (...e) => Je && ye(e, He);
D("Hello from the debug side!");
function ze(e) {
  try {
    const n = qe(
      be(e, { encoding: "utf-8" })
    );
    for (const t of Object.keys(n))
      Object.hasOwn($, t) ? d(
        `"${t}" is already defined in \`process.env\` and was __NOT__ overwritten!`
      ) : $[t] = n[t];
  } catch (n) {
    d(`Failed to load ${e} ${n.message}`), _(1);
  }
}
function qe(e) {
  const n = {};
  let t, o = e.replace(/\r\n?/gm, `
`);
  for (; (t = Ye.exec(o)) !== null; ) {
    const i = t[1];
    let c = (t[2] ?? "").trim();
    const l = c[0];
    c = c.replace(/^(['"`])([\s\S]*)\1$/gm, "$2"), l === '"' && (c = c.replace(/\\n/g, `
`).replace(/\\r/g, "\r")), n[i] = c;
  }
  return n;
}
const Ye = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function Ge(e) {
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
    esbuildConfig: c = {},
    root: l = pe()
  } = e;
  ze(a(l, ".env")), $.FORCE_COLOR = "2", t.push(
    ...Xe,
    "electron",
    "esbuild",
    "vite"
  ), i.push(/node_modules/);
  const I = r(e.srcPath ?? "src"), V = e.mainPath ? r(e.mainPath) : a(I, k), ce = a(l, "node_modules", "hmr-electron"), F = r(e.devOutputPath ?? ce), W = e.devBuildMainOutputPath ? r(e.devBuildMainOutputPath) : a(F, k), ae = a(F, H), le = e.devBuildElectronEntryFilePath ? r(e.devBuildElectronEntryFilePath) : a(W, "index.cjs"), ue = e.preloadFilePath ? r(e.preloadFilePath) : void 0, de = e.mainTSconfigPath ? r(e.mainTSconfigPath) : a(V, Ze), fe = e.viteConfigPath ? r(e.viteConfigPath) : te(Re, Ie), w = r(e.buildOutputPath ?? "build"), ge = e.buildRendererOutputPath ? r(e.buildRendererOutputPath) : a(w, H), me = e.buildMainOutputPath ? r(e.buildMainOutputPath) : a(w, k), he = r(e.electronEntryFilePath), S = {
    electronEsbuildExternalPackages: t,
    devBuildElectronEntryFilePath: le,
    devBuildRendererOutputPath: ae,
    buildRendererOutputPath: ge,
    devBuildMainOutputPath: W,
    electronEntryFilePath: he,
    viteExternalPackages: o,
    buildMainOutputPath: me,
    mainTSconfigPath: de,
    electronOptions: n,
    buildOutputPath: w,
    preloadFilePath: ue,
    viteConfigPath: fe,
    devOutputPath: F,
    esbuildConfig: c,
    esbuildIgnore: i,
    mainPath: V,
    srcPath: I,
    root: l
  };
  return Qe(S), N("Resolved config:", h(S)), S;
}
function Qe(e) {
  let n = !1;
  for (const [t, o] of Object.entries(e))
    !(t && o) || typeof o != "string" || Ke.includes(t) || b(o) || (T(Ne(t, o)), n = !0);
  n && (m("Resolved config:", h(e)), u("Resolve the errors above and try again."));
}
const Ke = [
  "devBuildElectronEntryFilePath",
  "devBuildRendererOutputPath",
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "devBuildMainOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "viteConfigPath",
  "devOutputPath"
], Xe = J.map((e) => `node:${e}`).concat(J), Ze = "tsconfig.json", H = "renderer", k = "main";
function et() {
  const e = r("hmr-electron.config.ts");
  b(e) && u("There already exists a config file for hmr-electron.");
  try {
    Ee(e, tt);
  } catch (n) {
    throw n;
  }
}
const tt = `import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
};

export default config;
`;
async function nt(e) {
  b(e) || u(
    `There must be a config file! Received: "${e}"`
  );
  let n = !1, t = "";
  [".ts", ".mts", ".cts"].some(
    (i) => e.endsWith(i)
  ) && (t = a(Fe(), "config-file-hmr-electron.mjs"), n = !0, Oe({
    entryPoints: [e],
    minifyIdentifiers: !1,
    minifyWhitespace: !1,
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
  const { default: o } = await (n ? import(t) : import(e)).catch(u).finally(() => n && B(t));
  return N(`User config = ${h(o)}`), o || u("Config file is required!"), o.electronEntryFilePath || u("`config.electronEntryFilePath` is required!"), o;
}
function z(e) {
  B(e.buildOutputPath, q), B(e.devOutputPath, q);
}
const q = { recursive: !0, force: !0 }, Y = {
  transform(e, n, t) {
    const o = e.toString(), i = null;
    o.includes(st, 49) || ot.test(o) || it.test(o) || rt.test(o) || t(i, o);
  }
}, ot = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/, it = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/, rt = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/, st = "unknown libva error, driver_name = (null)";
function G({
  devBuildElectronEntryFilePath: e,
  electronOptions: n,
  isTest: t = !1
}) {
  ct();
  const o = we(
    "electron",
    t ? [""] : [...n, e]
  ).on("exit", () => _(0)).on("spawn", () => {
    M.set(
      o.pid,
      o
    ), d("Electron reloaded"), D(
      `Electron child process has been spawned with args: ${Ve(
        o.spawnargs
      )}`
    );
  }), i = new U(Y), c = new U(Y);
  return o.stdout.pipe(i).pipe(process.stdout), o.stderr.pipe(c).pipe(process.stderr), o;
}
const M = /* @__PURE__ */ new Map();
function ct() {
  for (const [e, n] of M)
    try {
      n.removeAllListeners(), n.on("exit", () => M.delete(e)), Pe(e);
    } catch (t) {
      d("Error when killing Electron process:", t);
    }
}
function at(e) {
  return {
    name: "ignore-directories-and-files",
    setup(t) {
      t.onResolve(Q, ({ path: o }) => ({ path: o, namespace: L }));
      for (const o of e)
        t.onResolve({ filter: o }, ({ path: i }) => i.match(o) ? (d(`Ignoring "${i}"`), { path: i, namespace: L }) : { path: i });
      t.onLoad(Q, () => ({
        contents: ""
      }));
    }
  };
}
const lt = /[\s\S]*/gm, L = "ignore", Q = { filter: lt, namespace: L }, ut = g("[ERROR]"), K = g(y);
function dt(e) {
  if (!e.location)
    return e.message;
  const n = `file: ${Te(`"${e.location.file}"`)}
line: ${j(e.location.line)}
column: ${j(e.location.column)}
`, t = `${_e(`${e.location.line} |`)}  ${e.location.lineText}
${" ".repeat(e.location.column + `${e.location.line}`.length + 4)}${g("~".repeat(e.location.length))}`;
  return `${x()} ${ut}
${K}
${n}
${e.message}

${t}

${K}`;
}
const ft = (e) => T(gt(e));
function gt(e) {
  const n = `Found ${e.length} errors. Watching for file changes...`, t = e.map((l) => dt(l)), o = t.length;
  let i = "", c = 0;
  for (const l of t)
    i += `  • ${l}.`, c + 1 !== o && (i += `
`);
  return `${X}
${ne} ${R(
    "Some typescript compilation errors occurred:"
  )}

${i}

${R(n)}
${X}`;
}
const X = R(y);
async function ie(e) {
  const n = [e.electronEntryFilePath];
  e.preloadFilePath && (n.push(e.preloadFilePath), d(
    `Using preload file: "${e.preloadFilePath.substring(e.root.length)}".`
  ));
  try {
    const t = await xe({
      plugins: [
        at(e.esbuildIgnore)
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
      entryPoints: n,
      watch: e.isBuild ? !1 : {
        onRebuild(o) {
          o && ft(mt(o)), G(e);
        }
      },
      ...e.esbuildConfig
    });
    t.errors.length && d(`Esbuild build errors:
`, t.errors), ve("exit", () => t.stop?.()), e.isBuild || G(e);
  } catch (t) {
    T(t), _(1);
  }
}
const mt = (e) => e.errors.map((n) => ({
  location: n.location,
  message: n.text
}));
async function ht(e) {
  await Se({
    esbuild: se("browser", "esm", !0),
    build: re(e, "esm", !0),
    css: { devSourcemap: !0 },
    mode: "production",
    logLevel: "info",
    configFile: e.viteConfigPath
  });
}
const re = (e, n, t) => ({
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
    perf: !0,
    output: {
      sourcemap: t ? !1 : "inline",
      minifyInternalExports: t,
      compact: t,
      format: n,
      generatedCode: {
        objectShorthand: !0,
        constBindings: !0,
        preset: "es2015"
      }
    }
  }
}), se = (e, n, t) => ({
  minifyIdentifiers: t,
  minifyWhitespace: t,
  minifySyntax: t,
  sourcesContent: !1,
  legalComments: "none",
  sourcemap: "external",
  treeShaking: !0,
  target: "esnext",
  logLevel: "info",
  charset: "utf8",
  logLimit: 10,
  color: !0,
  platform: e,
  format: n
});
async function pt(e) {
  await Promise.all([
    ie({ ...e, isBuild: !0 }),
    ht(e)
  ]);
}
async function Pt(e) {
  const t = await (await Ce({
    esbuild: se("browser", "esm", !1),
    build: re(e, "esm", !1),
    css: { devSourcemap: !0 },
    mode: "development",
    logLevel: "info",
    configFile: e.viteConfigPath
  })).listen();
  N("Vite server config =", h(t.config));
  const o = t.httpServer.address();
  We(
    f(
      O(`Dev server running at address ${E(`http://${o}`)}.`)
    )
  );
}
async function vt(e) {
  await Promise.all([
    ie({ ...e, isBuild: !1 }),
    Pt(e)
  ]);
}
const Z = "hmr-electron", $t = "0.0.9";
async function yt() {
  const e = bt();
  if (Object.keys(e).length === 0)
    return Et();
  if (e.init)
    return et();
  const n = e["--config-file"], t = n ? r(n) : te(Be, De), o = await nt(t), i = Ge(o);
  if (e.dev)
    return e["--clean-cache"] && z(i), await vt(i);
  if (e.build)
    return z(i), await pt(i);
  d(`No commands matched. Args = ${e}`);
}
function bt() {
  const e = {};
  for (const n of $e.slice(2)) {
    const [t, o] = n.split("=");
    t && (o ? o === "false" ? e[t] = !1 : e[t] = o : e[t] = !0);
  }
  return D("argsAsObj =", h(e)), e;
}
function Et() {
  m(`${f(v(Z))} version ${$t}

${j("⚡")} Start developing your Electron + Vite app.

${f("Usage:")} ${Z} [command] [options]

  You must have a config file ('${v("hmr-electron.config.ts")}')
  file at the root of your package.

${f("Commands and options:")}
  init  ${v("Make a config file")}
  dev   [--config-file${ee}<configFilePath>] [--clean-cache]
  build [--config-file${ee}<configFilePath>]`);
}
const ee = O("=");
yt();
