import { resolve as s } from "node:path";
import { env as E, argv as S } from "node:process";
import { log as u, dir as O } from "node:console";
import { existsSync as k, rmSync as $ } from "node:fs";
const e = (o, t) => (n) => `\x1B[${o}m${n}\x1B[${t}m`, d = e(4, 24), i = e(1, 22), A = e(43, 49), N = e(44, 49), Z = e(35, 39), B = e(33, 39), m = e(32, 39), F = e(30, 39), f = e(34, 39), _ = e(90, 39), oo = e(36, 39), h = e(31, 39), p = "────────────────────────────────────────────────────────────────────────────────";
function C() {
  const o = new Date();
  return N(
    i(
      F(
        `[${a(o.getHours())}:${a(o.getMinutes())}:${a(
          o.getSeconds()
        )} ${a(o.getMilliseconds(), 3)}]`
      )
    )
  );
}
const a = (o, t = 2) => o.toString().padStart(t, "0"), D = A(
  i(F("[hmr-electron]"))
), L = () => w(
  `No config file (${d("'hmr-electron.config.ts'")}) found.`
), to = (o, t) => `File ${d(m(`"${o}"`))} not found. Received: ${f(t)}`, no = () => w(
  `Vite config file for main process ${d("NOT")} found.`
);
function w(o) {
  throw o = `
${h(p)}
${C()} ${o}
${h(p)}
`, new Error(o);
}
function eo(o) {
  return `[ ${o.map((n) => m(`"${n}"`)).join(", ")} ]`;
}
const M = (...o) => u(C(), D, ...o);
function H(o, t) {
  for (const n of o())
    if (k(n))
      return n;
  t();
}
const l = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"], V = "hmr-electron.config.", g = "vite.config.";
function* Y() {
  for (const o of l)
    yield s(`${V}${o}`);
}
function* ro() {
  for (const o of l)
    yield s(`${g}${o}`);
  for (const o of l)
    yield s("src", `${g}${o}`);
  for (const o of l)
    yield s("src", "renderer", `${g}${o}`);
}
const I = (o) => JSON.stringify(o, null, 2), x = E.DEBUG?.split(","), J = x?.includes("hmr-electron:config-result"), U = x?.includes("hmr-electron"), q = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: !1,
  sorted: !1,
  colors: !0,
  depth: 10
}, j = (...o) => U && u(...o), so = (...o) => J && O(o, q);
j("Hello from the debug side!");
function y(o) {
  $(o.buildOutputPath, b), $(o.devOutputPath, b);
}
const b = { recursive: !0, force: !0 }, v = "hmr-electron", G = "0.0.12";
async function R() {
  const o = T();
  if (Object.keys(o).length === 0)
    return z();
  if (o.init)
    return (await import("./makeConfigFile-1650d4ea.js")).makeConfigFile();
  const t = o["--config-file"], n = t ? s(t) : H(Y, L), r = await (await import("./readConfigFile-3c3569f8.js")).readConfigFile(n), c = (await import("./config-7d96e55c.js")).makeConfigProps(
    r
  );
  if (o.dev)
    return o["--clean-cache"] && y(c), await (await import("./runDev-c21116bf.js")).runDev(c);
  if (o.build)
    return y(c), await (await import("./runBuild-0faeb47a.js")).runBuild(c);
  M(`No commands matched. Args = ${o}`);
}
function T() {
  const o = {};
  for (const t of S.slice(2)) {
    const [n, r] = t.split("=");
    n && (r ? r === "false" ? o[n] = !1 : o[n] = r : o[n] = !0);
  }
  return j("argsAsObj =", I(o)), o;
}
function z() {
  u(`${i(f(v))} version ${G}

${B("⚡")} Start developing your Electron + Vite app.

${i("Usage:")} ${v} [command] [options]

  You must have a config file ('${f("hmr-electron.config.ts")}')
  file at the root of your package.

${i("Commands and options:")}
  init  ${f("Make a config file")}
  dev   [--config-file${P}<configFilePath>] [--clean-cache]
  build [--config-file${P}<configFilePath>]`);
}
const P = m("=");
process.title = "hmr-electron";
R();
export {
  to as a,
  j as b,
  oo as c,
  ro as d,
  C as e,
  H as f,
  _ as g,
  M as h,
  p as i,
  D as j,
  so as l,
  Z as m,
  eo as p,
  h as r,
  I as s,
  w as t,
  no as v,
  B as y
};
