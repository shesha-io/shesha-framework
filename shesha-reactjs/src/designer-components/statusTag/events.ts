import { StandardEventHandler, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * The events a status tag exposes: On Click and On Mouse Move.
 *
 * The component is display-only — it renders a status and never captures one — so every event tied
 * to editing has nothing to fire on: no value change (`onChange`), nothing focusable to enter or
 * leave (`onFocus`/`onBlur`), and no text entry to report keystrokes for. Advertising those would
 * give the user handlers that could be configured but would never run.
 *
 * Declared as the settings-form list and derived for the runtime below, so the two cannot drift —
 * see the note on `ALL_INPUT_EVENTS`.
 */
export const STATUS_TAG_EVENTS: readonly StandardEventHandler[] = ['onClick', 'onMouseMove'];

/**
 * The runtime set handed to `getComponentEvents`.
 *
 * Identical to `STATUS_TAG_EVENTS` — the component emits no `onChange`, so there is nothing to
 * strip — but derived rather than re-listed so adding an event above cannot leave the runtime
 * behind, and typed without `onChange` to match what `getComponentEvents` accepts.
 */
export const STATUS_TAG_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  STATUS_TAG_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');
