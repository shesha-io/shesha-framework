import { IBackgroundValue, IShadowValue } from '@/designer-components/_settings/utils';
import { IPropertySetting, IStyleValue, StyleBoxValue } from '@/providers/form/models';
import { ILabelValue } from '@/components/dropdown/model';
import { IStatusMappings } from '@/components/statusTag';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { jsonSafeParse } from '@/utils/object';

/**
 * The complete background shape, as `card` and `drawer` define it. Every slot must be present or the
 * Appearance tab shows no inheritance state for the compound background inputs.
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

/** Zeroed, so the Shadow panel offers inheritance without rendering a visible shadow. */
const SHADOW_DEFAULTS = (): IShadowValue => ({
  offsetX: 0,
  offsetY: 0,
  blurRadius: 0,
  spreadRadius: 0,
  color: '#000',
});

/** Zeroed margin/padding, present for the same inheritance reason. */
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
 * A single flat style set describing the tag; `styles.ts` scopes it onto the tag element. Colour
 * slots are left empty so the Variant decides them — seeded, they are emitted at `&&&&` and beat
 * antd's variant rules. `border` omits `all` for the same reason.
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

/** Sentinel for the catch-all row, which had no code of its own. A string cannot collide with a real code. */
export const DEFAULT_STATUS_VALUE = 'default';

/**
 * Default Mappings was a code editor, so the user's text is moved across as the Values script body
 * rather than parsed into rows. `mapping` is unwrapped to the bare array the setting expects; a
 * table without it is passed through whole.
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

/** The 0.45 Default Mappings table, shipped as a script so the inline Values editor starts empty. */
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
