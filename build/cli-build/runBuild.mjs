import { r as i, b as o } from "./runViteFrontendBuild.mjs";
import "esbuild";
import "node:console";
import "node:process";
import "./parseCliArgs.mjs";
import "node:path";
import "./main.mjs";
import "process";
import "node:fs";
import "node:child_process";
import "node:stream";
import "vite";
async function c(r) {
  await Promise.all([
    i({ ...r, isBuild: !0 }),
    o(r)
  ]);
}
export {
  c as runBuild
};
