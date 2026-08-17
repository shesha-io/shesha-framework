import { IBackgroundValue, IShadowValue } from "@/designer-components/_settings/utils";
import { INestedStyleValue, IStyleValue, StyleBoxValue } from "@/providers/form/models";

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
 * A no-op shadow. `styles.ts` reads `shadow`/`tag.shadow`, so the slot has to be present for the
 * Shadow panel to offer inheritance — an absent slot renders nothing *and* shows no inheritance
 * state. The zeroed values emit a shadow that is not visible, leaving appearance unchanged.
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
  marginTop: "0",
  marginRight: "0",
  marginBottom: "0",
  marginLeft: "0",
  paddingTop: "0",
  paddingRight: "0",
  paddingBottom: "0",
  paddingLeft: "0",
});

/**
 * Appearance defaults for an unconfigured dropdown.
 *
 * Includes the nested `tag` set: the migration that used to seed tag styles is guarded by
 * `isNew`, so a freshly dropped component gets its tag appearance from here instead.
 */
export const defaultStyles = (): INestedStyleValue<'tag'> => {
  return {
    tag: defaultTagStyles(),
    background: BACKGROUND_DEFAULTS('#fff'),
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
    },
    border: {
      border: {
        all: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: 'auto',
      minHeight: '32px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: SHADOW_DEFAULTS(),
    stylingBoxJson: STYLING_BOX_DEFAULTS(),
  };
};

export const defaultTagStyles = (): IStyleValue => {
  return {
    background: BACKGROUND_DEFAULTS('#f0f0f0'),
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
      align: 'center',
    },
    border: {
      border: {
        all: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
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
    // Only the left margin differs from the shared defaults: it separates a tag from the one
    // before it. Spreading keeps the two in step as default slots are added.
    stylingBoxJson: { ...STYLING_BOX_DEFAULTS(), marginLeft: "8" },
  };
};

export const presetColors = [
  {
    value: 'success',
    label: 'Success',
  },
  {
    value: 'warning',
    label: 'Warning',
  },
  {
    value: 'error',
    label: 'Error',
  },
  {
    value: 'magenta',
    label: 'Magenta',
  },
  {
    value: 'red',
    label: 'Red',
  },
  {
    value: 'orange',
    label: 'Orange',
  },
  {
    value: 'gold',
    label: 'Gold',
  },
  {
    value: 'lime',
    label: 'Lime',
  },
  {
    value: 'green',
    label: 'Green',
  },
  {
    value: 'cyan',
    label: 'Cyan',
  },
  {
    value: 'blue',
    label: 'Blue',
  },
  {
    value: 'geekblue',
    label: 'Geekblue',
  },
  {
    value: 'purple',
    label: 'Purple',
  },
];
