# Solid 2.0: `from()` lands the first value of a synchronous burst even after it has been superseded

Repro for [solidjs/solid#5066](https://github.com/solidjs/solid/issues/5066). Pinned to `solid-js`, `@solidjs/signals` and `@solidjs/web` 2.0.2.

`from(subscribe)` is documented to keep only the latest value. When several values arrive in one synchronous turn while the memo is waiting on a pull, the first one still lands in its own pass, and the latest one lands in a second pass. The first value is already stale by the time the memo reads it.

## Run it

```sh
npm install
npm run repro   # minimal case in plain Node
npm test        # both cases as vitest tests (jsdom); both FAIL today
npm run dev     # the controlled input in a browser
```

## 1. Minimal case

`minimal.mjs` (and `test/minimal.test.js`) emits `0` during subscribe, then `1`, `2`, `3` in one synchronous turn.

- Expected: `[0, 3]`
- Actual: `[0, 1, 3]`

`npm run repro` runs `node --conditions=browser minimal.mjs`. Without `--conditions=browser`, Node resolves the server build of `solid-js`, and the effect never runs.

## 2. Practical case: a controlled input

`src/Field.jsx` binds a controlled `<input value={...}>` to a `from()` subscription over a plain external store (`src/form-store.js`). That store notifies subscribers with a fresh snapshot on every `update()`. One keystroke makes two synchronous updates:

```jsx
const state = createMemo(() => from((next) => form.subscribe(next)));

const onInput = (e) => {
  form.update({ touched: true });               // snapshot 1: old text
  form.update({ text: e.currentTarget.value }); // snapshot 2: new text
};

<input value={state().text} onInput={onInput} />
```

Snapshot 1, which still carries the old text, lands in its own pass. Solid writes the old text over what the user just typed (dev: `UNCOMMITTED_INPUT_OVERWRITTEN`). Snapshot 2 then writes the new text back, and the caret ends up at the end of the field.

`test/field.test.jsx` types `X` at position 2 of `hello world`:

|                    | expected       | actual                            |
| ------------------ | -------------- | --------------------------------- |
| writes to `.value` | `heXllo world` | `hello world`, then `heXllo world` |
| caret afterwards   | 3              | 12 (end of the field)             |
| dev diagnostics    | none           | `UNCOMMITTED_INPUT_OVERWRITTEN`   |

To try it by hand, run `npm run dev`, put the caret in the middle of the text and type a letter. The same sequence should make the caret jump to the end, and the console should show `[UNCOMMITTED_INPUT_OVERWRITTEN]`.

## Environment

The automated cases (`npm run repro`, `npm test`) were run on macOS with Node 26.8.2. The browser steps were not scripted.

---

This repro was prepared with AI assistance (Claude) and verified by running it.
