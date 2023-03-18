import { existsSync as f, rmSync as s } from "node:fs";
import { buildSync as m } from "esbuild";
import { tmpdir as a } from "node:os";
import { join as l } from "node:path";
import { t as i, l as c } from "./main.mjs";
import "node:console";
import "node:process";
async function w(e) {
  f(e) || i(
    `There must be a config file! Received: "${e}"`
  );
  let o = !1, r = "";
  [".ts", ".mts", ".cts"].some(
    (n) => e.endsWith(n)
  ) && (r = l(a(), "config-file-hmr-electron.mjs"), o = !0, m({
    entryPoints: [e],
    minifyIdentifiers: !1,
    minifyWhitespace: !1,
    minifySyntax: !1,
    logLevel: "warning",
    treeShaking: !0,
    sourcemap: !1,
    target: "esnext",
    platform: "node",
    charset: "utf8",
    format: "esm",
    logLimit: 10,
    color: !0,
    write: !0,
    outfile: r
    // If ever needed, use imports from the user's node_modules. Check
    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L931
    // at plugins.
  }));
  const { default: t } = await (o ? import(r) : import(e)).catch(i).finally(() => o && s(r));
  return c("User config =", t), t || i("Config file is required!"), t.electronEntryFilePath || i("`config.electronEntryFilePath` is required!"), t;
}
export {
  w as readConfigFile
};
