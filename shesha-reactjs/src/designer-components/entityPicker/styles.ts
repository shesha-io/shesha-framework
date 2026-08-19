import { createStyles } from '@/styles';
import { IEntityPickerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IEntityPickerComponentProps) => {
  const textAlign = model.font?.align;
  const divider = model.border?.border?.middle;
  /* Emitted after `fontStyles` so a Custom style overrides the Font panel property by property —
     one that sets only `color` keeps the configured size and family. */
  const textStyles = fontStyles(model.font, model.styleCss);

  /* `cssPropertiesToString` is not redundant next to `textStyles`: `fontStyles` only emits colour,
     size, weight, family and alignment, so the Custom style's other text properties — line-height,
     letter-spacing, text-transform and the rest — reach the element only through this call. */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
    ${textStyles}
    ${cssPropertiesToString(model.styleCss)}
  `;

  /* antd repaints the background on :hover, on :focus/:focus-within and with the `background`
     shorthand on the error/warning statuses — the shorthand also wipes a configured image or
     gradient. Re-assert the configured appearance in each state so it does not visibly disappear
     while the field is being used or is failing validation. */
  const statefulAppearance = `
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }
  `;

  const entityPicker = cx('sha-entity-picker', css`
    ${dimensionsStyles(model.dimensions)}
    ${configuredAppearance}
    ${statefulAppearance}

    /* Uses prefixCls rather than a hardcoded ant- prefix, to match every other selector here and
       keep working under a customised antd prefix. */
    .${prefixCls}-select-content {
      ${textStyles}
    }

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
        ${textStyles}
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

      /* antd sets the font on each of these elements itself, so the configured font has to be
         restated here rather than left to inherit from the selector. justify-content carries the
         alignment because they are flex items: text-align alone does not move them. */
      .${prefixCls}-select-selection-item,
      .${prefixCls}-select-selection-search-input,
      .${prefixCls}-select-selection-placeholder {
        ${textStyles}
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
      }

      /* In multiple mode antd wraps each tag's label in a further element and sets the font on
         that, so the rule above stops at the tag box and the label keeps the theme font. */
      .${prefixCls}-select-selection-item-content {
        ${textStyles}
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
