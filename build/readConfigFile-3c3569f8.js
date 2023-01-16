import { existsSync as s, rmSync as f } from "node:fs";
import { buildSync as m } from "esbuild";
import { tmpdir as a } from "node:os";
import { join as l } from "node:path";
import { t as i, l as c, s as p } from "./main-1db4fdc1.js";
import "node:process";
import "node:console";
async function x(e) {
  s(e) || i(
    `There must be a config file! Received: "${e}"`
  );
  let o = !1, t = "";
  [".ts", ".mts", ".cts"].some(
    (n) => e.endsWith(n)
  ) && (t = l(a(), "config-file-hmr-electron.mjs"), o = !0, m({
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
  const { default: r } = await (o ? import(t) : import(e)).catch(i).finally(() => o && f(t));
  return c(`User config = ${p(r)}`), r || i("Config file is required!"), r.electronEntryFilePath || i("`config.electronEntryFilePath` is required!"), r;
}
export {
  x as readConfigFile
};
