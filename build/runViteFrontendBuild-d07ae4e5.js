import { build as v } from "esbuild";
import { error as y } from "node:console";
import { exit as $, kill as P } from "node:process";
import { spawn as S } from "node:child_process";
import { Transform as g } from "node:stream";
import { h as s, b as k, p as w, c as O, y as m, g as R, r as d, e as L, i as x, j as C, m as a } from "./main-1db4fdc1.js";
import { build as F } from "vite";
const f = {
  transform(e, o, t) {
    const n = e.toString(), r = null;
    n.includes(_, 49) || j.test(n) || B.test(n) || M.test(n) || t(r, n);
  }
}, j = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/, B = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/, M = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/, _ = "unknown libva error, driver_name = (null)";
function p({
  devBuildElectronEntryFilePath: e,
  electronOptions: o,
  isTest: t = !1
}) {
  A();
  const n = S(
    "electron",
    t ? [""] : [...o, e]
  ).on("exit", () => $(0)).on("spawn", () => {
    c.set(
      n.pid,
      n
    ), s("Electron reloaded"), k(
      `Electron child process has been spawned with args: ${w(
        n.spawnargs
      )}`
    );
  }), r = new g(f), i = new g(f);
  return n.stdout.pipe(r).pipe(process.stdout), n.stderr.pipe(i).pipe(process.stderr), n;
}
const c = /* @__PURE__ */ new Map();
function A() {
  for (const [e, o] of c)
    try {
      o.removeAllListeners(), o.on("exit", () => c.delete(e)), P(e);
    } catch (t) {
      s("Error when killing Electron process:", t);
    }
}
function D(e) {
  return {
    name: "ignore-directories-and-files",
    setup(t) {
      t.onResolve(h, ({ path: n }) => ({ path: n, namespace: u }));
      for (const n of e)
        t.onResolve({ filter: n }, ({ path: r }) => r.match(n) ? (s(`Ignoring "${r}"`), { path: r, namespace: u }) : { path: r });
      t.onLoad(h, () => ({
        contents: ""
      }));
    }
  };
}
const I = /[\s\S]*/gm, u = "ignore", h = { filter: I, namespace: u }, z = d("[ERROR]"), E = d(x);
function W(e) {
  if (!e.location)
    return e.message;
  const o = `file: ${O(`"${e.location.file}"`)}
line: ${m(e.location.line)}
column: ${m(e.location.column)}
`, t = `${R(`${e.location.line} |`)}  ${e.location.lineText}
${" ".repeat(e.location.column + `${e.location.line}`.length + 4)}${d("~".repeat(e.location.length))}`;
  return `${L()} ${z}
${E}
${o}
${e.message}

${t}

${E}`;
}
const J = (e) => y(T(e));
function T(e) {
  const o = `Found ${e.length} errors. Watching for file changes...`, t = e.map((l) => W(l)), n = t.length;
  let r = "", i = 0;
  for (const l of t)
    r += `  • ${l}.`, i + 1 !== n && (r += `
`);
  return `${b}
${C} ${a(
    "Some typescript compilation errors occurred:"
  )}

${r}

${a(o)}
${b}`;
}
const b = a(x);
async function Z(e) {
  const o = [e.electronEntryFilePath];
  e.preloadFilePath && (o.push(e.preloadFilePath), s(
    `Using preload file: "${e.preloadFilePath.substring(e.root.length)}".`
  ));
  try {
    const t = await v({
      plugins: [
        D(e.esbuildIgnore)
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
      metafile: !1,
      format: "cjs",
      logLimit: 10,
      bundle: !0,
      color: !0,
      entryPoints: o,
      watch: e.isBuild ? !1 : {
        onRebuild(n) {
          n && J(N(n)), p(e);
        }
      },
      ...e.esbuildConfig
    });
    t.errors.length && s(`Esbuild build errors:
`, t.errors), process.on("exit", () => {
      console.log("is there a stop fn?", t.stop), t.stop?.();
    }), e.isBuild || p(e);
  } catch (t) {
    y(t), $(1);
  }
}
const N = (e) => e.errors.map((o) => ({
  location: o.location,
  message: o.text
}));
async function ee(e) {
  await F({
    esbuild: U("browser", "esm", !0),
    build: H(e, "esm", !0),
    css: { devSourcemap: !0 },
    mode: "production",
    logLevel: "info",
    configFile: e.viteConfigPath
  });
}
const H = (e, o, t) => ({
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
      format: o,
      generatedCode: {
        objectShorthand: !0,
        constBindings: !0,
        preset: "es2015"
      }
    }
  }
}), U = (e, o, t) => ({
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
  format: o
});
export {
  H as a,
  ee as b,
  Z as r,
  U as v
};
