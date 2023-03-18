import { resolve as n } from "node:path";
import { log as F } from "node:console";
import { b, a as m, c as p, u as a, g as $, d as w, r as f, e as l, f as C } from "./main.mjs";
import { rmSync as u, existsSync as v } from "node:fs";
function h() {
  const t = /* @__PURE__ */ new Date();
  return b(
    m(
      p(
        `[${i(t.getHours())}:${i(t.getMinutes())}:${i(
          t.getSeconds()
        )} ${i(t.getMilliseconds(), 3)}]`
      )
    )
  );
}
const i = (t, o = 2) => t.toString().padStart(o, "0"), x = C(
  m(p("[hmr-electron]"))
), S = () => P(
  `No config file (${a("'hmr-electron.config.ts'")}) found.`
), B = (t, o) => `File ${a($(`"${t}"`))} not found. Received: ${w(o)}`, R = () => P(
  `Vite config file for main process ${a("NOT")} found.`
);
function P(t) {
  throw t = `
${f(l)}
${h()} ${t}
${f(l)}
`, new Error(t);
}
function T(t) {
  const o = [];
  for (const e of t)
    o.push($(`"${e}"`));
  return `[ ${o.join(", ")} ]`;
}
const j = (...t) => F(h(), x, ...t);
function d(t) {
  u(t.buildOutputPath, g), u(t.devOutputPath, g);
}
const g = { recursive: !0, force: !0 };
function A(t, o) {
  for (const e of t())
    if (v(e))
      return e;
  o();
}
const s = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"], E = "hmr-electron.config.", c = "vite.config.";
function* N() {
  for (const t of s)
    yield n(`${E}${t}`);
}
function* V() {
  for (const t of s)
    yield n(`${c}${t}`);
  for (const t of s)
    yield n("src", `${c}${t}`);
  for (const t of s)
    yield n("src", "renderer", `${c}${t}`);
}
async function O(t) {
  if (t.init)
    return (await import("./makeConfigFile.mjs")).makeConfigFile();
  const o = t["--config-file"], e = o ? n(o) : A(N, S), y = await (await import("./readConfigFile.mjs")).readConfigFile(e), r = (await import("./makeConfigProps.mjs")).makeConfigProps(y);
  if (t.dev)
    return t["--clean-cache"] && d(r), await (await import("./runDev.mjs")).runDev(r);
  if (t.build)
    return d(r), await (await import("./runBuild.mjs")).runBuild(r);
  j(`No commands matched. Args = ${t}`);
}
const Y = Object.freeze(Object.defineProperty({
  __proto__: null,
  matchAndRunArgs: O
}, Symbol.toStringTag, { value: "Module" }));
export {
  B as a,
  x as b,
  Y as c,
  V as d,
  A as f,
  h as g,
  j as h,
  T as p,
  P as t,
  R as v
};
