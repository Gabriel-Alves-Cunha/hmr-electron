import { v as e, a as o, r as s } from "./runViteFrontendBuild-d07ae4e5.js";
import { createServer as t } from "vite";
import { l as n, s as a } from "./main-1db4fdc1.js";
import "esbuild";
import "node:console";
import "node:process";
import "node:child_process";
import "node:stream";
import "node:path";
import "node:fs";
async function l(i) {
  const r = await (await t({
    esbuild: e("browser", "esm", !1),
    build: o(i, "esm", !1),
    css: { devSourcemap: !0 },
    mode: "development",
    logLevel: "info",
    configFile: i.viteConfigPath
  })).listen();
  n("Vite server config =", a(r.config)), r.printUrls();
}
async function S(i) {
  await Promise.all([
    s({ ...i, isBuild: !1 }),
    l(i)
  ]);
}
export {
  S as runDev
};
