import { StandardEventHandler, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * The events a status tag exposes: On Click and On Hover.
 *
 * The component displays a status rather than capturing one, so the editing events have nothing to
 * fire on — there is no value change (`onChange`), and nothing focusable to enter or leave
 * (`onFocus`/`onBlur`), nor any keystrokes to report. Advertising them would give the user handlers
 * that could be configured but would never run.
 *
 * "On Hover" is `onMouseEnter`/`onMouseLeave`: the pair is what a hover actually consists of, and
 * both are already labelled as such by the shared event metadata.
 *
 * Declared as the settings-form list and derived for the runtime below, so the two cannot drift —
 * see the note on `ALL_INPUT_EVENTS`.
 */
export const STATUS_TAG_EVENTS: readonly StandardEventHandler[] = ['onClick', 'onMouseEnter', 'onMouseLeave'];

/**
 * The runtime set handed to `getComponentEvents`.
 *
 * Identical to `STATUS_TAG_EVENTS` — the component emits no `onChange`, so there is nothing to
 * strip — but derived rather than re-listed so adding an event above cannot leave the runtime
 * behind, and typed without `onChange` to match what `getComponentEvents` accepts.
 */
export const STATUS_TAG_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  STATUS_TAG_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');
