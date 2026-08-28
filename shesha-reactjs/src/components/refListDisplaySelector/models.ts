import { isDefined } from '@/utils/nullables';

/**
 * What a reference list value shows: the item's name, its icon, or both.
 *
 * There is deliberately no fourth "neither" mode. A status that draws nothing is not a configuration
 * worth offering, so the selector has no state for it and the invariant holds by construction.
 */
export type RefListDisplayMode = 'name' | 'icon' | 'both';

/**
 * Resolved form of {@link RefListDisplayValue}, and the shape a JS setting is expected to return -
 * flags rather than a mode, so an expression can decide each one independently from the row's data.
 */
export interface IRefListDisplay {
  showName: boolean;
  showIcon: boolean;
}

/** A mode chosen in the selector, or the flags a JS setting returned in its place. */
export type RefListDisplayValue = RefListDisplayMode | IRefListDisplay;

const MODES: Record<RefListDisplayMode, IRefListDisplay> = {
  name: { showName: true, showIcon: false },
  icon: { showName: false, showIcon: true },
  both: { showName: true, showIcon: true },
};

/** Matches what the component showed before the selector existed: the name, and no icon. */
export const DEFAULT_REF_LIST_DISPLAY_MODE: RefListDisplayMode = 'name';

/** Accepts a bare string too, for callers narrowing a value that arrived from outside the type. */
export const isRefListDisplayMode = (value: RefListDisplayValue | string | undefined): value is RefListDisplayMode =>
  value === 'name' || value === 'icon' || value === 'both';

const isRefListDisplay = (value: RefListDisplayValue | undefined): value is IRefListDisplay =>
  isDefined(value) && typeof value === 'object' && ('showName' in value || 'showIcon' in value);

/**
 * Normalises either form into the flags the component renders from.
 *
 * Two cases fall back to the default mode rather than to an empty tag: a value that is neither a
 * mode nor the expected object - a JS setting that returned nothing usable, the declared type being
 * no guarantee there - and one that turns both flags off. The selector cannot produce that second
 * case, but an expression can, and the invariant it enforces structurally has to hold here too.
 */
export const resolveRefListDisplay = (value: RefListDisplayValue | undefined): IRefListDisplay => {
  if (isRefListDisplayMode(value))
    return MODES[value];

  if (isRefListDisplay(value)) {
    const resolved = { showName: value.showName === true, showIcon: value.showIcon === true };
    return resolved.showName || resolved.showIcon ? resolved : MODES[DEFAULT_REF_LIST_DISPLAY_MODE];
  }

  return MODES[DEFAULT_REF_LIST_DISPLAY_MODE];
};

/** The mode a value corresponds to, for the selector to show as chosen. */
export const toRefListDisplayMode = (value: RefListDisplayValue | undefined): RefListDisplayMode => {
  const { showName, showIcon } = resolveRefListDisplay(value);
  return showName && showIcon ? 'both' : showIcon ? 'icon' : 'name';
};
