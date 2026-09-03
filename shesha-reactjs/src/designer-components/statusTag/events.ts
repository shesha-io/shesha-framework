import { StandardEventHandler, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * On Click and hover only — the component is display-only, so the editing events
 * (change/focus/blur/keys) have nothing to fire on.
 *
 * Hover is the enter/leave pair rather than `onMouseMove`, which fires continuously while the
 * pointer moves, or `onMouseOver`/`onMouseOut`, which bubble and so re-fire when the pointer crosses
 * between the tag and its own icon or label.
 */
export const STATUS_TAG_EVENTS: readonly StandardEventHandler[] = ['onClick', 'onMouseEnter', 'onMouseLeave'];

/** Derived so the settings list and the runtime list cannot drift. */
export const STATUS_TAG_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  STATUS_TAG_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');
