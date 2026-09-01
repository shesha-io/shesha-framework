import { StandardEventHandler, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * On Click and On Mouse Move only — the component is display-only, so the editing events
 * (change/focus/blur/keys) have nothing to fire on.
 */
export const STATUS_TAG_EVENTS: readonly StandardEventHandler[] = ['onClick', 'onMouseMove'];

/** Derived so the settings list and the runtime list cannot drift. */
export const STATUS_TAG_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  STATUS_TAG_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');
