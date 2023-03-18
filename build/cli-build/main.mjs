import { exit as d } from "process";
import { log as l, dir as h } from "node:console";
import { env as p, argv as b } from "node:process";
function $(o) {
  let e = 0;
  for (const t in o)
    ++e;
  return e;
}
const n = (o, e) => (t) => `\x1B[${o}m${t}\x1B[${e}m`, E = n(4, 24), c = n(1, 22), S = n(43, 49), Y = n(44, 49), D = n(35, 39), y = n(33, 39), v = n(32, 39), F = n(30, 39), a = n(34, 39), H = n(90, 39), J = n(36, 39), M = n(31, 39), P = "────────────────────────────────────────────────────────────────────────────────", i = "hmr-electron", x = "0.1.4";
function j() {
  l(`${c(a(i))} version ${x}

${y("⚡")} Start developing your Electron + Vite app.

${c("Usage:")} ${i} [command] [options]

  You must have a config file ('${a("hmr-electron.config.ts")}')
  file at the root of your package.

${c("Commands and options:")}
  init  ${a("Make a config file")}
  dev   [--config-file${r}<configFilePath>] [--clean-cache]
  build [--config-file${r}<configFilePath>]`);
}
const r = v("="), g = (o) => JSON.stringify(o, null, 2), f = p.DEBUG?.split(","), A = f?.includes("hmr-electron:config-result"), L = f?.includes("hmr-electron"), k = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: !1,
  sorted: !1,
  colors: !0,
  depth: 10
}, m = (...o) => L && l(...o), U = (o, ...e) => A && h(`${o} ${g(e)}`, k);
m("Hello from the debug side!");
function w() {
  const o = {};
  for (const e of b.slice(2)) {
    const [t, s] = e.split("=");
    t && (s ? s === "false" ? o[t] = !1 : o[t] = s : o[t] = !0);
  }
  return m("argsAsObj =", g(o)), o;
}
process.title = "hmr-electron";
const u = w();
$(u) === 0 && (j(), d(0));
await (await import("./parseCliArgs.mjs").then((o) => o.c)).matchAndRunArgs(u);
export {
  c as a,
  Y as b,
  F as c,
  a as d,
  P as e,
  S as f,
  v as g,
  m as h,
  J as i,
  H as j,
  U as l,
  D as m,
  M as r,
  g as s,
  E as u,
  y
};
