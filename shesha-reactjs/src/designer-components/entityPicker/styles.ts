import { createStyles } from '@/styles';
import { IEntityPickerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';

/**
 * Emits the Appearance style set for the picker.
 *
 * The picker is not a single antd control: it lays a borderless `Select` and an ellipsis `Button`
 * side by side inside a wrapper element. The wrapper is what the user sees as "the field", so the
 * border, background and shadow land there and both children are neutralised — otherwise the two
 * paint their own box inside the configured one and the border reads as doubled.
 *
 * Only properties actually present in the model emit CSS, so anything left unconfigured keeps
 * cascading from the theme.
 */
/**
 * Text-affecting properties of a Custom style.
 *
 * The Custom style describes both the box and the text, and the two halves belong on different
 * elements here: the box half rides the wrapper as an inline `style`, but an inline style on the
 * wrapper never reaches the text, because antd sets colour and font on the inner elements
 * themselves and a class rule on the child beats an inherited inline value. The text half is
 * therefore re-emitted in the rules that target those inner elements.
 */
const TEXT_PROPERTIES: ReadonlySet<string> = new Set([
  'color', 'font', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight',
  'letterSpacing', 'lineHeight', 'textAlign', 'textDecoration', 'textTransform', 'wordSpacing',
  'whiteSpace', 'textOverflow', 'textShadow',
]);

const textPropertiesOf = (style: CSSProperties | undefined): CSSProperties => {
  if (!isDefined(style)) return {};
  const text: Record<string, unknown> = {};
  Object.entries(style).forEach(([key, value]) => {
    if (TEXT_PROPERTIES.has(key)) text[key] = value;
  });
  return text as CSSProperties;
};

export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IEntityPickerComponentProps) => {
  const textAlign = model.font?.align;
  const divider = model.border?.border?.middle;
  /* Emitted after `fontStyles` so a Custom style overrides the Font panel property by property —
     one that sets only `color` keeps the configured size and family. */
  const customTextStyle = cssPropertiesToString(textPropertiesOf(model.styleCss));

  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  /* antd repaints the background on :hover (hoverBg), on :focus/:focus-within (activeBg) and with
     the `background` shorthand on the error/warning statuses — the shorthand also wipes a
     configured image or gradient. Re-assert the configured appearance in each of those states so
     it does not visibly disappear while the user interacts with the field or fails validation. */
  const statefulAppearance = `
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }
  `;

  /* No margin here: the picker renders inside a ConfigurableFormItem, and `sha-form-item` already
     emits marginStyles from this same `stylingBoxJson`. Emitting it again on the wrapper would
     apply the configured margin twice. Padding stays — that one is the control's own. */
  const entityPicker = cx('sha-entity-picker', css`
    ${dimensionsStyles(model.dimensions)}
    ${configuredAppearance}
    ${statefulAppearance}

    display: flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
    overflow: hidden;

    /* The select fills the row minus the ellipsis button and paints nothing of its own: the
       wrapper above already carries the configured box. */
    .${prefixCls}-select {
      flex: 1 1 auto;
      min-width: 0;
      height: 100%;
      background: transparent;
      border: none;
      box-shadow: none;
      margin: 0;

      .${prefixCls}-select-selector {
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font)}
        ${customTextStyle}
        height: 100%;
        background: transparent;
        border: none;
        box-shadow: none;
        overflow: auto;
        scrollbar-width: thin;

        ::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }
      }

      /* antd sets font on these elements themselves, so the configured font has to be restated
         here rather than left to inherit from the selector. */
      .${prefixCls}-select-selection-item,
      .${prefixCls}-select-selection-search-input,
      .${prefixCls}-select-selection-placeholder {
        ${fontStyles(model.font)}
        ${customTextStyle}
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
      }

      /* The picker opens a modal rather than a dropdown list, so the multi-select overflow suffix
         (the "+N" counter antd renders for a collapsed selection) has nothing to expand into. */
      .${prefixCls}-select-selection-overflow-item-suffix {
        display: none;
      }
    }

    /* The ellipsis button is a divider away from the select, not a box of its own: it keeps the
       wrapper background and draws only the left-hand divider line. That line comes from the
       Border panel's "middle" edge, which is what the picker used before the Appearance tab and
       is the only border edge that has no other meaning on a single-box control. */
    .sha-entity-picker-button {
      flex: 0 0 auto;
      height: auto;
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      margin: 0;
      border-left-style: ${divider?.style ?? 'solid'};
      border-left-width: ${isDefined(divider?.width) ? addPx(divider.width) : '1px'};
      border-left-color: ${divider?.color ?? '#d9d9d9'};

      &:hover,
      &:focus {
        background: transparent;
        border-left-color: ${token.colorPrimary};
      }
    }
  `);

  return {
    entityPicker,
  };
});
