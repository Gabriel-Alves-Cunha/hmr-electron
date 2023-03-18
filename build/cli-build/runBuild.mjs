import { r as i, b as o } from "./runViteFrontendBuild.mjs";
import "esbuild";
import "node:console";
import "node:process";
import "./main.mjs";
import "node:path";
import "node:fs";
import "node:child_process";
import "node:stream";
import "vite";
async function B(r) {
  await Promise.all([
    i({ ...r, isBuild: !0 }),
    o(r)
  ]);
}
export {
  B as runBuild
};
