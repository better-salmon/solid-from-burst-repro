import { createEffect, createMemo, createRoot, flush, from } from "solid-js";
import { expect, test } from "vitest";

test("a synchronous burst lands only its latest value", async () => {
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

  expect(seen).toEqual([0, 3]); // actual: [0, 1, 3]
});
