import { StandardEventHandler, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * The events the address component exposes on its Events tab.
 *
 * The control renders a Google Places autocomplete whose inner antd `Input` already owns
 * `onKeyDown` and `onBlur` for the suggestions dropdown (arrow-key navigation, closing on blur),
 * so those two are wired through the control rather than bound directly and are deliberately
 * absent here. `onSelect` is address-specific and is registered separately in the settings form —
 * it is not one of the standard input events.
 */
export const ADDRESS_EVENTS: readonly StandardEventHandler[] = [
  'onChange', 'onFocus', 'onClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave',
];

/** `ADDRESS_EVENTS` minus `onChange` — the set the runtime binds via `getComponentEvents`. */
export const ADDRESS_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  ADDRESS_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');
