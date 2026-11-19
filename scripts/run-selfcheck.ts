import { runSelfChecks } from "../src/engine/selfcheck";

const results = runSelfChecks();
let failed = 0;
for (const result of results) {
  const mark = result.pass ? "PASS" : "FAIL";
  if (!result.pass) failed += 1;
  console.log(`${mark}  ${result.name}  (${result.detail})`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
if (failed > 0) {
  throw new Error(`${failed} self-check(s) failed`);
}
