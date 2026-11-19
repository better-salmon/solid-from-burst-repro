// A plain external store (no Solid inside): every update() notifies
// subscribers with a fresh snapshot, like most state libraries.
export function createFormStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    update(patch) {
      state = { ...state, ...patch };
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
  };
}
