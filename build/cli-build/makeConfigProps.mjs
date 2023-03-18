import { builtinModules as b } from "node:module";
import { join as a, resolve as i } from "node:path";
import { error as S, log as _ } from "node:console";
import { readFileSync as k, existsSync as $ } from "node:fs";
import { env as d, exit as j, cwd as N } from "node:process";
import { h as v, d as T, f as L, l as I, a as J, s as Q, t as V, v as q, b as z } from "./main.mjs";
function A(t) {
  try {
    const n = D(
      k(t, { encoding: "utf-8" })
    );
    for (const e of Object.keys(n))
      Object.hasOwn(d, e) ? v(
        `"${e}" is already defined in \`process.env\` and was __NOT__ overwritten!`
      ) : d[e] = n[e];
    T("Parsed enviroment variables =", d);
  } catch (n) {
    v(`Failed to load ${t} ${n.message}`), j(1);
  }
}
function D(t) {
  const n = {};
  let e, o = t.replace(/\r\n?/gm, `
`);
  for (; (e = G.exec(o)) !== null; ) {
    const u = e[1];
    let r = (e[2] ?? "").trim();
    const l = r[0];
    r = r.replace(/^(['"`])([\s\S]*)\1$/gm, "$2"), l === '"' && (r = r.replace(/\\n/g, `
`).replace(/\\r/g, "\r")), n[u] = r;
  }
  return n;
}
const G = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function nt(t) {
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
    electronEsbuildExternalPackages: e = [],
    viteExternalPackages: o = [],
    esbuildIgnore: u = [],
    esbuildConfig: r = {},
    root: l = N()
  } = t;
  A(a(l, ".env")), d.FORCE_COLOR = "2", e.push(
    ...E,
    "electron",
    "esbuild",
    "vite"
  ), u.push(/node_modules/);
  const f = i(t.srcPath ?? "src"), g = t.mainPath ? i(t.mainPath) : a(f, P), F = a(
    l,
    "node_modules",
    "hmr-electron",
    "user-dev-build"
  ), s = i(t.devOutputPath ?? F), m = t.devBuildMainOutputPath ? i(t.devBuildMainOutputPath) : a(s, P), y = a(s, O), p = t.devBuildElectronEntryFilePath ? i(t.devBuildElectronEntryFilePath) : a(m, "index.cjs"), w = t.preloadFilePath ? i(t.preloadFilePath) : void 0, x = t.mainTSconfigPath ? i(t.mainTSconfigPath) : a(g, U), C = t.viteConfigPath ? i(t.viteConfigPath) : L(z, q), c = i(t.buildOutputPath ?? "build"), B = t.buildRendererOutputPath ? i(t.buildRendererOutputPath) : a(c, O), M = t.buildMainOutputPath ? i(t.buildMainOutputPath) : a(c, P), R = i(t.electronEntryFilePath), h = {
    electronEsbuildExternalPackages: e,
    devBuildElectronEntryFilePath: p,
    devBuildRendererOutputPath: y,
    buildRendererOutputPath: B,
    devBuildMainOutputPath: m,
    electronEntryFilePath: R,
    viteExternalPackages: o,
    buildMainOutputPath: M,
    mainTSconfigPath: x,
    electronOptions: n,
    buildOutputPath: c,
    preloadFilePath: w,
    viteConfigPath: C,
    devOutputPath: s,
    esbuildConfig: r,
    esbuildIgnore: u,
    mainPath: g,
    srcPath: f,
    root: l
  };
  return H(h), I("Resolved config:", h), h;
}
function H(t) {
  let n = !1;
  for (const [e, o] of Object.entries(t))
    !(e && o) || typeof o != "string" || K.has(e) || $(o) || (S(J(e, o)), n = !0);
  n && (_("Resolved config:", Q(t)), V("Resolve the errors above and try again."));
}
const K = /* @__PURE__ */ new Set([
  "devBuildElectronEntryFilePath",
  "devBuildRendererOutputPath",
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "devBuildMainOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "viteConfigPath",
  "devOutputPath"
]), E = [...b];
for (const t of b)
  E.push(`node:${t}`);
const U = "tsconfig.json", O = "renderer", P = "main";
export {
  nt as makeConfigProps
};
