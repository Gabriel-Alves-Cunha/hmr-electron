import { v as e, a as o, r as t } from "./runViteFrontendBuild.mjs";
import { createServer as s } from "vite";
import { l as n } from "./main.mjs";
import "esbuild";
import "node:console";
import "node:process";
import "./parseCliArgs.mjs";
import "node:path";
import "node:fs";
import "node:child_process";
import "node:stream";
import "process";
async function a(i) {
  const r = await (await s({
    esbuild: e("browser", "esm", !1),
    build: o(i, "esm", !1),
    css: { devSourcemap: !0 },
    mode: "development",
    logLevel: "info",
    configFile: i.viteConfigPath
  })).listen();
  n("Vite server config =", r.config), r.printUrls();
}
async function F(i) {
  await Promise.all([
    t({ ...i, isBuild: !1 }),
    a(i)
  ]);
}
export {
  F as runDev
};
