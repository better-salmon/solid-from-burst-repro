import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, expect, test, vi } from "vitest";
import { Field } from "../src/Field.jsx";
import { createFormStore } from "../src/form-store.js";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

test("typing in the middle of a controlled input keeps the text and the caret", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const form = createFormStore({ text: "hello world", touched: false });
  const host = document.body.appendChild(document.createElement("div"));
  render(() => <Field form={form} />, host);
  flush();

  const input = host.querySelector("input");
  const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const writes = [];
  Object.defineProperty(input, "value", {
    configurable: true,
    get() {
      return proto.get.call(this);
    },
    set(v) {
      writes.push(v);
      proto.set.call(this, v);
    },
  });

  // The user types "X" at caret position 2: "he|llo world" -> "heX|llo world".
  input.focus();
  proto.set.call(input, "heXllo world");
  input.setSelectionRange(3, 3);
  input.dispatchEvent(new InputEvent("input", { bubbles: true, data: "X", inputType: "insertText" }));

  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    flush();
  }

  const codes = warn.mock.calls.map((args) => String(args[0]).match(/^\[([A-Z_]+)\]/)?.[1]);
  const result = { writes, value: input.value, caret: input.selectionStart, codes };
  console.log(result);

  // actual: { writes: ["hello world", "heXllo world"], value: "heXllo world",
  //           caret: 12, codes: ["UNCOMMITTED_INPUT_OVERWRITTEN"] }
  // The stale snapshot's "hello world" is written over the user's text, then
  // the latest one is written back; each write moves the caret to the end.
  expect(result).toEqual({
    writes: ["heXllo world"],
    value: "heXllo world",
    caret: 3,
    codes: [],
  });
});
