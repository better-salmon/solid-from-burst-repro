// Minimal case: three values in one synchronous turn after the source was idle.
// Run with `npm run repro` (node --conditions=browser; without it Node loads
// the server build of solid-js and the effect never runs).
import { createEffect, createMemo, createRoot, flush, from } from "solid-js";

let emit;
const seen = [];

createRoot(() => {
  const value = createMemo(() =>
    from((next) => {
      emit = next;
      next(0);
      return () => {};
    })
  );
  createEffect(value, (v) => {
    seen.push(v);
  });
});
flush();

emit(1);
emit(2);
emit(3);

for (let i = 0; i < 5; i++) {
  await Promise.resolve();
  flush();
}

console.log("actual:  ", seen);
console.log("expected:", [0, 3]);
process.exitCode = JSON.stringify(seen) === "[0,3]" ? 0 : 1;
