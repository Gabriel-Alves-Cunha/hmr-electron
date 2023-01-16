import { r as i, b as o } from "./runViteFrontendBuild-d07ae4e5.js";
import "esbuild";
import "node:console";
import "node:process";
import "node:child_process";
import "node:stream";
import "./main-1db4fdc1.js";
import "node:path";
import "node:fs";
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
