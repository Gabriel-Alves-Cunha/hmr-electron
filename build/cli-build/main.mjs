import { resolve as s } from "node:path";
import { log as u, dir as A } from "node:console";
import { rmSync as $, existsSync as O } from "node:fs";
import { env as N, argv as k } from "node:process";
function L(t) {
  let o = 0;
  for (const n in t)
    ++o;
  return o;
}
const e = (t, o) => (n) => `\x1B[${t}m${n}\x1B[${o}m`, d = e(4, 24), r = e(1, 22), B = e(43, 49), D = e(44, 49), tt = e(35, 39), M = e(33, 39), m = e(32, 39), w = e(30, 39), f = e(34, 39), ot = e(90, 39), nt = e(36, 39), h = e(31, 39), p = "────────────────────────────────────────────────────────────────────────────────";
function C() {
  const t = /* @__PURE__ */ new Date();
  return D(
    r(
      w(
        `[${a(t.getHours())}:${a(t.getMinutes())}:${a(
          t.getSeconds()
        )} ${a(t.getMilliseconds(), 3)}]`
      )
    )
  );
}
const a = (t, o = 2) => t.toString().padStart(o, "0"), H = B(
  r(w("[hmr-electron]"))
), V = () => x(
  `No config file (${d("'hmr-electron.config.ts'")}) found.`
), et = (t, o) => `File ${d(m(`"${t}"`))} not found. Received: ${f(o)}`, it = () => x(
  `Vite config file for main process ${d("NOT")} found.`
);
function x(t) {
  throw t = `
${h(p)}
${C()} ${t}
${h(p)}
`, new Error(t);
}
function st(t) {
  const o = [];
  for (const n of t)
    o.push(m(`"${n}"`));
  return `[ ${o.join(", ")} ]`;
}
const Y = (...t) => u(C(), H, ...t);
function y(t) {
  $(t.buildOutputPath, b), $(t.devOutputPath, b);
}
const b = { recursive: !0, force: !0 };
function J(t, o) {
  for (const n of t())
    if (O(n))
      return n;
  o();
}
const l = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"], R = "hmr-electron.config.", g = "vite.config.";
function* U() {
  for (const t of l)
    yield s(`${R}${t}`);
}
function* rt() {
  for (const t of l)
    yield s(`${g}${t}`);
  for (const t of l)
    yield s("src", `${g}${t}`);
  for (const t of l)
    yield s("src", "renderer", `${g}${t}`);
}
async function q(t) {
  if (t.init)
    return (await import("./makeConfigFile.mjs")).makeConfigFile();
  const o = t["--config-file"], n = o ? s(o) : J(U, V), i = await (await import("./readConfigFile.mjs")).readConfigFile(n), c = (await import("./makeConfigProps.mjs")).makeConfigProps(i);
  if (t.dev)
    return t["--clean-cache"] && y(c), await (await import("./runDev.mjs")).runDev(c);
  if (t.build)
    return y(c), await (await import("./runBuild.mjs")).runBuild(c);
  Y(`No commands matched. Args = ${t}`);
}
const v = "hmr-electron", G = "0.1.4";
function I() {
  u(`${r(f(v))} version ${G}

${M("⚡")} Start developing your Electron + Vite app.

${r("Usage:")} ${v} [command] [options]

  You must have a config file ('${f("hmr-electron.config.ts")}')
  file at the root of your package.

${r("Commands and options:")}
  init  ${f("Make a config file")}
  dev   [--config-file${P}<configFilePath>] [--clean-cache]
  build [--config-file${P}<configFilePath>]`);
}
const P = m("="), j = (t) => JSON.stringify(t, null, 2), E = N.DEBUG?.split(","), T = E?.includes("hmr-electron:config-result"), _ = E?.includes("hmr-electron"), z = {
  maxStringLength: 1e3,
  maxArrayLength: 300,
  compact: !1,
  sorted: !1,
  colors: !0,
  depth: 10
}, S = (...t) => _ && u(...t), ct = (t, ...o) => T && A(`${t} ${j(o)}`, z);
S("Hello from the debug side!");
function K() {
  const t = {};
  for (const o of k.slice(2)) {
    const [n, i] = o.split("=");
    n && (i ? i === "false" ? t[n] = !1 : t[n] = i : t[n] = !0);
  }
  return S("argsAsObj =", j(t)), t;
}
process.title = "hmr-electron";
const F = K();
L(F) === 0 ? I() : await q(F);
export {
  et as a,
  rt as b,
  nt as c,
  S as d,
  C as e,
  J as f,
  ot as g,
  Y as h,
  p as i,
  H as j,
  ct as l,
  tt as m,
  st as p,
  h as r,
  j as s,
  x as t,
  it as v,
  M as y
};
