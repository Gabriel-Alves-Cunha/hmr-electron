import { buildSync as b, context as v } from "esbuild";
import { error as y } from "node:console";
import { exit as x, kill as P } from "node:process";
import { h as s, p as S, g as k, b as w } from "./parseCliArgs.mjs";
import { spawn as O } from "node:child_process";
import { Transform as m } from "node:stream";
import { h as L, i as R, y as g, j as C, r as d, e as $, m as l } from "./main.mjs";
import { build as F } from "vite";
function j(e) {
  return {
    name: "ignore-directories-and-files",
    setup(t) {
      t.onResolve(f, ({ path: n }) => ({ path: n, namespace: c }));
      for (const n of e)
        t.onResolve({ filter: n }, ({ path: r }) => r.match(n) ? (s(`Ignoring "${r}"`), { path: r, namespace: c }) : { path: r });
      t.onLoad(f, () => ({
        contents: ""
      }));
    }
  };
}
const B = /[\s\S]*/gm, c = "ignore", f = { filter: B, namespace: c }, p = {
  transform(e, o, t) {
    const n = e.toString(), r = null;
    n.includes(D, 49) || M.test(n) || _.test(n) || A.test(n) || t(r, n);
  }
}, M = /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/, _ = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/, A = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/, D = "unknown libva error, driver_name = (null)";
function I({
  devBuildElectronEntryFilePath: e,
  electronOptions: o,
  isTest: t = !1
}) {
  z();
  const n = O(
    "electron",
    t ? [""] : [...o, e]
  ).on("exit", () => x(0)).on("spawn", () => {
    u.set(
      n.pid,
      n
    ), s("Electron reloaded"), L(
      `Electron child process has been spawned with args: ${S(
        n.spawnargs
      )}`
    );
  }), r = new m(p), i = new m(p);
  return n.stdout.pipe(r).pipe(process.stdout), n.stderr.pipe(i).pipe(process.stderr), n;
}
const u = /* @__PURE__ */ new Map();
function z() {
  for (const [e, o] of u)
    try {
      o.removeAllListeners(), o.on("exit", () => u.delete(e)), P(e);
    } catch (t) {
      s("Error killing Electron process:", t);
    }
}
const N = d("[ERROR]"), h = d($);
function W(e) {
  if (!e.location)
    return e.message;
  const o = `file: ${R(`"${e.location.file}"`)}
line: ${g(e.location.line)}
column: ${g(e.location.column)}
`, t = `${C(`${e.location.line} |`)}  ${e.location.lineText}
${" ".repeat(e.location.column + `${e.location.line}`.length + 4)}${d("~".repeat(e.location.length))}`;
  return `${k()} ${N}
${h}
${o}
${e.message}

${t}

${h}`;
}
const J = (e) => y(T(e));
function T(e) {
  const o = `Found ${e.length} errors. Watching for file changes...`, t = [];
  for (const a of e)
    t.push(W(a));
  const { length: n } = t;
  let r = "", i = 0;
  for (const a of t)
    r += `  • ${a}.`, i + 1 !== n && (r += `
`);
  return `${E}
${w} ${l(
    "Some typescript compilation errors occurred:"
  )}

${r}

${l(o)}
${E}`;
}
const E = l($), H = (e) => ({
  name: "on-end",
  setup(o) {
    let t = 0;
    o.onEnd((n) => {
      s(`Build nº ${t++}:`), n.errors.length && J(
        n.errors.map(
          (r) => ({
            location: r.location,
            message: r.text
          })
        )
      ), I(e);
    });
  }
});
async function te(e) {
  const o = [e.electronEntryFilePath];
  e.preloadFilePath && (o.push(e.preloadFilePath), s(
    `Using preload file: "${e.preloadFilePath.substring(e.root.length)}".`
  ));
  try {
    const t = {
      outdir: e.isBuild ? e.buildMainOutputPath : e.devBuildMainOutputPath,
      external: e.electronEsbuildExternalPackages,
      minifyIdentifiers: e.isBuild,
      tsconfig: e.mainTSconfigPath,
      minifyWhitespace: e.isBuild,
      outExtension: { ".js": ".cjs" },
      // Electron currently only accepts cjs.
      minifySyntax: e.isBuild,
      minify: e.isBuild,
      sourcesContent: !1,
      legalComments: "none",
      sourcemap: "external",
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
      ...e.esbuildConfig
    };
    if (e.isBuild) {
      b(t);
      return;
    }
    t.plugins = [
      j(e.esbuildIgnore),
      H(e)
      // On end, restart electron.
    ];
    const n = await v(t);
    process.on("exit", () => n.dispose().then()), await n.watch();
  } catch (t) {
    y(t), x(1);
  }
}
async function ne(e) {
  await F({
    esbuild: V("browser", "esm", !0),
    build: U(e, "esm", !0),
    css: { devSourcemap: !0 },
    mode: "production",
    logLevel: "info",
    configFile: e.viteConfigPath
  });
}
const U = (e, o, t) => ({
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
      assetFileNames: "assets/[name].[ext]",
      minifyInternalExports: t,
      // entryFileNames: "[name].mjs",
      chunkFileNames: "[name].mjs",
      compact: t,
      format: o,
      generatedCode: {
        objectShorthand: !0,
        constBindings: !0,
        preset: "es2015"
      }
    }
  }
}), V = (e, o, t) => ({
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
  U as a,
  ne as b,
  te as r,
  V as v
};
