import { IBackgroundValue, IShadowValue } from '@/designer-components/_settings/utils';
import { IPropertySetting, IStyleValue, StyleBoxValue } from '@/providers/form/models';
import { ILabelValue } from '@/components/dropdown/model';
import { IStatusMappings } from '@/components/statusTag';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { jsonSafeParse } from '@/utils/object';

/**
 * The complete background shape, as `card` and `drawer` define it.
 *
 * Every slot has to be present for the Appearance tab to offer inheritance on the compound
 * background inputs: the inheritance popover only renders for properties the default model actually
 * contains, so a bare `{ type, color }` leaves size/position/repeat/gradient/image with nothing to
 * inherit from and no inheritance state shown at all.
 */
const BACKGROUND_DEFAULTS = (color: string): IBackgroundValue => ({
  type: 'color',
  color,
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
  gradient: { direction: 'to right', colors: [] },
  url: '',
});

/**
 * A no-op shadow, present so the Shadow panel offers inheritance — an absent slot renders nothing
 * *and* shows no inheritance state. The zeroed values emit a shadow that is not visible.
 */
const SHADOW_DEFAULTS = (): IShadowValue => ({
  offsetX: 0,
  offsetY: 0,
  blurRadius: 0,
  spreadRadius: 0,
  color: '#000',
});

/** Zeroed margin/padding, present for the same inheritance reason as `SHADOW_DEFAULTS`. */
const STYLING_BOX_DEFAULTS = (): StyleBoxValue => ({
  _type: 'styleBox',
  marginTop: '0',
  marginRight: '0',
  marginBottom: '0',
  marginLeft: '0',
  paddingTop: '0',
  paddingRight: '8',
  paddingBottom: '0',
  paddingLeft: '8',
});

/**
 * Appearance defaults for an unconfigured status tag.
 *
 * A single, flat style set — there is deliberately no nested second set and no container styles.
 * The component *is* the tag, so every Appearance input describes the tag itself; a wrapper set
 * would give the user two places to configure one visible thing, and a container border or
 * background would draw an empty-looking box around the status. `styles.ts` scopes these flat
 * properties onto the tag element, the same way the checkbox scopes its set onto the box.
 *
 * The colour-bearing slots are left empty so the Variant decides them: seeded, they are emitted at
 * `&&&&` and beat antd's variant rules, which is what the dropdown's migration 15 had to undo.
 * `border` omits `all` for the same reason — `borderLinesStyles` emits a border for any present
 * `all`, so even an empty one erases the Variant's border.
 */
export const defaultStyles = (): IStyleValue => {
  return {
    // Empty, not a grey: a seeded colour is emitted at `&&&&` and paints every tag that has no
    // colour of its own, overriding whatever the Variant would have drawn.
    background: BACKGROUND_DEFAULTS('#d9d9d9'),
    font: {
      weight: '400',
      size: 14,
      type: 'Segoe UI',
      align: 'center',
    },
    border: {
      radius: { all: 4 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'auto',
      height: '22px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: SHADOW_DEFAULTS(),
    stylingBoxJson: STYLING_BOX_DEFAULTS(),
  };
};

/**
 * The value the catch-all row is stored under.
 *
 * `mappings.default` had no code — it was matched by *failing* to match anything else. `values` has
 * no catch-all concept, so the row needs a value of its own to exist as an option; a sentinel is
 * used rather than a number so it can never collide with a real reference-list code.
 */
export const DEFAULT_STATUS_VALUE = 'default';

/**
 * The legacy Default Mappings JSON, as a Values script.
 *
 * Default Mappings was a code editor, so what the user wrote is source text, not data. It is moved
 * across as the body of the Values script rather than parsed into rows: parsing would discard
 * whatever the author actually wrote — comments, formatting, and the `override`/`text` distinction
 * the mapping shape carries — and hand them back a list they did not write. As a script it stays
 * theirs, and the inline editor stays empty.
 *
 * `mapping` is unwrapped to the bare array because that is the list the Values setting expects; a
 * table with no `mapping` is passed through whole so nothing is silently dropped.
 */
export const mappingsToValuesSetting = (mappings: string | undefined): IPropertySetting<ILabelValue<number | string>[]> | undefined => {
  if (!isNotNullOrWhiteSpace(mappings)) return undefined;

  const parsed = jsonSafeParse<IStatusMappings>(mappings);
  const rows = parsed?.mapping;
  const body = isDefined(rows)
    ? JSON.stringify(rows, null, 2)
    : mappings.trim();

  return {
    _mode: 'code',
    _code: `return ${body};`,
    // The inline editor stays empty: the script above is what supplies the options.
    _value: [],
  };
};

/**
 * The Values setting a status tag ships with, as a script rather than rows in the inline editor.
 *
 * The returned array is the mapping table 0.45 seeded into Default Mappings, in its original shape
 * (`code`/`text`/`color`/`override`) so it reads the same way it did there. Shipping it as a script
 * leaves the inline Values editor empty — a new component is not pre-filled with four rows the user
 * has to clear — while still showing the statuses out of the box.
 */
export const defaultValuesSetting = (): IPropertySetting<ILabelValue<number | string>[]> => ({
  _mode: 'code',
  _code: `return [
  { code: 1, text: 'Completed', color: '#87d068' },
  { code: 2, text: 'In Progress', color: '#4DA6FF', override: 'Still Busy!' },
  { code: 3, text: 'Overdue', color: '#cd201f' },
  { code: 4, text: 'Pending', color: '#FF7518' },
];`,
  // The inline editor stays empty: the script above is what supplies the options.
  _value: [],
});
