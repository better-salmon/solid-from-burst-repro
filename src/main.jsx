import { render } from "@solidjs/web";
import { Field } from "./Field.jsx";
import { createFormStore } from "./form-store.js";

const form = createFormStore({ text: "hello world", touched: false });

render(
  () => (
    <main>
      <p>Put the caret in the middle of the text and type a letter.</p>
      <Field form={form} />
    </main>
  ),
  document.getElementById("app")
);
