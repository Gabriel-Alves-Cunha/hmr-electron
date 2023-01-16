import { builtinModules as v } from "node:module";
import { join as a, resolve as i } from "node:path";
import { error as _, log as $ } from "node:console";
import { readFileSync as j, existsSync as k } from "node:fs";
import { env as P, exit as S, cwd as N } from "node:process";
import { h as O, f as T, l as L, s as E, a as I, t as J, v as Q, d as V } from "./main-1db4fdc1.js";
function q(t) {
  try {
    const n = z(
      j(t, { encoding: "utf-8" })
    );
    for (const e of Object.keys(n))
      Object.hasOwn(P, e) ? O(
        `"${e}" is already defined in \`process.env\` and was __NOT__ overwritten!`
      ) : P[e] = n[e];
  } catch (n) {
    O(`Failed to load ${t} ${n.message}`), S(1);
  }
}
function z(t) {
  const n = {};
  let e, o = t.replace(/\r\n?/gm, `
`);
  for (; (e = A.exec(o)) !== null; ) {
    const u = e[1];
    let r = (e[2] ?? "").trim();
    const l = r[0];
    r = r.replace(/^(['"`])([\s\S]*)\1$/gm, "$2"), l === '"' && (r = r.replace(/\\n/g, `
`).replace(/\\r/g, "\r")), n[u] = r;
  }
  return n;
}
const A = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function et(t) {
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
  q(a(l, ".env")), P.FORCE_COLOR = "2", e.push(
    ...H,
    "electron",
    "esbuild",
    "vite"
  ), u.push(/node_modules/);
  const f = i(t.srcPath ?? "src"), g = t.mainPath ? i(t.mainPath) : a(f, h), F = a(l, "node_modules", "hmr-electron"), c = i(t.devOutputPath ?? F), m = t.devBuildMainOutputPath ? i(t.devBuildMainOutputPath) : a(c, h), y = a(c, b), p = t.devBuildElectronEntryFilePath ? i(t.devBuildElectronEntryFilePath) : a(m, "index.cjs"), w = t.preloadFilePath ? i(t.preloadFilePath) : void 0, x = t.mainTSconfigPath ? i(t.mainTSconfigPath) : a(g, K), C = t.viteConfigPath ? i(t.viteConfigPath) : T(V, Q), d = i(t.buildOutputPath ?? "build"), B = t.buildRendererOutputPath ? i(t.buildRendererOutputPath) : a(d, b), M = t.buildMainOutputPath ? i(t.buildMainOutputPath) : a(d, h), R = i(t.electronEntryFilePath), s = {
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
    buildOutputPath: d,
    preloadFilePath: w,
    viteConfigPath: C,
    devOutputPath: c,
    esbuildConfig: r,
    esbuildIgnore: u,
    mainPath: g,
    srcPath: f,
    root: l
  };
  return D(s), L("Resolved config:", E(s)), s;
}
function D(t) {
  let n = !1;
  for (const [e, o] of Object.entries(t))
    !(e && o) || typeof o != "string" || G.includes(e) || k(o) || (_(I(e, o)), n = !0);
  n && ($("Resolved config:", E(t)), J("Resolve the errors above and try again."));
}
const G = [
  "devBuildElectronEntryFilePath",
  "devBuildRendererOutputPath",
  "preloadSourceMapFilePath",
  "buildRendererOutputPath",
  "devBuildMainOutputPath",
  "buildMainOutputPath",
  "buildOutputPath",
  "viteConfigPath",
  "devOutputPath"
], H = v.map((t) => `node:${t}`).concat(v), K = "tsconfig.json", b = "renderer", h = "main";
export {
  et as makeConfigProps
};
