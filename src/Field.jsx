import { createMemo, from } from "solid-js";

export function Field(props) {
  const form = props.form;
  const state = createMemo(() => from((next) => form.subscribe(next)));

  // One keystroke = two synchronous store updates in the same turn.
  const onInput = (e) => {
    form.update({ touched: true });
    form.update({ text: e.currentTarget.value });
  };

  return (
    <label>
      Name: <input value={state().text} onInput={onInput} />{" "}
      {state().touched ? "(touched)" : ""}
    </label>
  );
}
