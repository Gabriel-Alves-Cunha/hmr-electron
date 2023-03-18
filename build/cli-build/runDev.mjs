import { v as r, a as o, r as t } from "./runViteFrontendBuild.mjs";
import { createServer as s } from "vite";
import { l as n } from "./main.mjs";
import "esbuild";
import "node:console";
import "node:process";
import "node:child_process";
import "node:stream";
import "node:path";
import "node:fs";
async function a(i) {
  const e = await (await s({
    esbuild: r("browser", "esm", !1),
    build: o(i, "esm", !1),
    css: { devSourcemap: !0 },
    mode: "development",
    logLevel: "info",
    configFile: i.viteConfigPath
  })).listen();
  n("Vite server config =", e.config), e.printUrls();
}
async function w(i) {
  await Promise.all([
    t({ ...i, isBuild: !1 }),
    a(i)
  ]);
}
export {
  w as runDev
};
