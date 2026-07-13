// Verifies the SHIPPED nav auto-hide logic by extracting the inline IIFE from
// the built dist/index.html and running it against a mocked DOM + a controllable
// IntersectionObserver. Proves: (1) initial sync state, (2) reveal when no CTA
// intersects, (3) re-tuck when a CTA intersects again — the callback wiring the
// automation browser couldn't exercise (it won't scroll the page).
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(process.argv[2], "utf8");
// pick the inline <script> block that actually carries the tuck logic
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const scriptText = scripts.find((s) => s.includes("is-tucked") && s.includes("setTuck"));
if (!scriptText) { console.error("FAIL: could not locate nav-tuck script in built HTML"); process.exit(1); }

// ---- mock DOM ------------------------------------------------------------
let ioCallback = null;
class FakeClassList {
  constructor() { this.set = new Set(); }
  toggle(c, on) { on ? this.set.add(c) : this.set.delete(c); }
  contains(c) { return this.set.has(c); }
}
function makeEl(onScreen) {
  return {
    classList: new FakeClassList(),
    style: { transition: "" },
    _inert: false,
    _rect: onScreen ? { top: 100, bottom: 160 } : { top: 5000, bottom: 5060 },
    toggleAttribute(name, on) { if (name === "inert") this._inert = !!on; },
    getBoundingClientRect() { return this._rect; },
  };
}
const nav = makeEl(false);
const heroCta = makeEl(true);   // hero CTA visible at load
const finalCta = makeEl(false); // final CTA far below at load

const doc = {
  querySelector: (s) => (s === ".nav" ? nav : null),
  querySelectorAll: (s) => (s === "[data-cta]" ? [heroCta, finalCta] : []),
};
const sandbox = {
  window: { innerHeight: 800, IntersectionObserver: true },
  document: doc,
  requestAnimationFrame: (fn) => fn(),
  IntersectionObserver: class {
    constructor(cb) { ioCallback = cb; }
    observe() {}
  },
  Set,
  Array,
};
sandbox.window.requestAnimationFrame = sandbox.requestAnimationFrame;
vm.createContext(sandbox);
vm.runInContext(scriptText, sandbox);

// ---- drive + assert ------------------------------------------------------
const results = [];
const check = (name, cond) => { results.push([name, cond]); };

// 1. initial: hero CTA on screen -> tucked
check("initial: nav tucked while hero CTA on screen", nav.classList.contains("is-tucked") === true);
check("initial: hidden nav is inert", nav._inert === true);

// 2. scroll past both CTAs (neither intersects) -> revealed
ioCallback([
  { target: heroCta, isIntersecting: false },
  { target: finalCta, isIntersecting: false },
]);
check("mid-page: nav revealed when no CTA on screen", nav.classList.contains("is-tucked") === false);
check("mid-page: revealed nav not inert", nav._inert === false);

// 3. final CTA scrolls into view -> re-tucked
ioCallback([{ target: finalCta, isIntersecting: true }]);
check("bottom: nav re-tucks when final CTA on screen", nav.classList.contains("is-tucked") === true);

// 4. final CTA leaves again -> revealed
ioCallback([{ target: finalCta, isIntersecting: false }]);
check("after: nav revealed again once final CTA leaves", nav.classList.contains("is-tucked") === false);

let ok = true;
for (const [name, cond] of results) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) ok = false;
}
console.log(ok ? "\nALL PASS — shipped nav-tuck logic verified" : "\nFAILED");
process.exit(ok ? 0 : 1);
