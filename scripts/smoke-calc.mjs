import { readFileSync } from "node:fs";

const refining = JSON.parse(readFileSync("public/data/refining.json", "utf8"));
const items = JSON.parse(readFileSync("public/data/items.json", "utf8"));

function yieldScore(r) {
  const t = r.inputs.reduce((s, i) => s + i.amount, 0) || 1;
  return r.output.amount / t;
}

function pickBest(rs) {
  return [...rs].sort(
    (a, b) =>
      yieldScore(b) - yieldScore(a) ||
      (a.timeSec ?? 1e9) - (b.timeSec ?? 1e9),
  )[0];
}

function pickQuick(rs) {
  return [...rs].sort(
    (a, b) =>
      (a.timeSec ?? 1e9) - (b.timeSec ?? 1e9) ||
      yieldScore(b) - yieldScore(a),
  )[0];
}

function isSelf(r) {
  return r.inputs.some((i) => i.itemId === r.output.itemId);
}

function plan(recipe, targetAmount) {
  const target = Math.max(1, Math.ceil(targetAmount));
  const out = recipe.output.amount || 1;
  if (!isSelf(recipe)) {
    const batches = Math.ceil(target / out);
    return { batches, output: batches * out, self: false };
  }
  const seed =
    recipe.inputs.find((i) => i.itemId === recipe.output.itemId)?.amount ?? 0;
  const net = out - seed;
  const batches = Math.ceil(target / net);
  return { batches, output: seed + batches * net, self: true, net };
}

const chrom = refining.filter((r) => r.output.itemId === "STELLAR2");
const best = pickBest(chrom);
const quick = pickQuick(chrom);
const chlorineLoop = refining.find(
  (r) =>
    r.output.itemId === "WATER2" &&
    isSelf(r) &&
    r.inputs.some((i) => i.itemId === "OXYGEN"),
);

const checks = [
  ["chromatic recipe count", chrom.length === 25],
  [
    "best is silver+gold+indium -> 30",
    best?.output.amount === 30 &&
      best.inputs.map((i) => i.itemId).join(",") === "ASTEROID1,ASTEROID2,BLUE2",
  ],
  [
    "quick is indium -> 4",
    quick?.output.amount === 4 &&
      quick.inputs.length === 1 &&
      quick.inputs[0].itemId === "BLUE2",
  ],
  ["chlorine loop exists", Boolean(chlorineLoop)],
  ["chlorine plan 100 needs 20 batches", plan(chlorineLoop, 100).batches === 20],
  ["items include chromatic", items.STELLAR2?.name === "Chromatic Metal"],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failed += 1;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("All smoke checks passed.");
}
