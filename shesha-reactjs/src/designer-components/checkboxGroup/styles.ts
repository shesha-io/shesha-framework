import { CSSProperties } from 'react';
import { createStyles } from '@/styles';
import { CheckboxGroupComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles, splitBackgroundProperties } from '../_common/styles/utils';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { addPx } from '@/utils/style';

/**
 * Emits the two Appearance style sets.
 *
 * The bare-named model properties style the component wrapper (the group container). The `option`
 * set is scoped to each `.ant-checkbox` descendant, which is what makes it apply per checkbox
 * rather than to the whole group. Mirrors the standalone Checkbox component so both look
 * consistent.
 */

const borderWidthFromWeight = (weight: string | undefined): string => {
  switch (weight) {
    case '100':
      return '1px';
    case '400':
      return '2px';
    case '500':
      return '3px';
    case '700':
      return '4px';
    case '900':
      return '5px';
    default:
      return '2px';
  }
};

/**
 * `checkbox.style` holds a JS expression, so the Factory evaluates it and passes the resulting
 * CSSProperties in as `checkboxStyleJson`. The wrapper's own custom style is applied inline by
 * the framework (as `styleJson`), but a nested set has no such route — it has to be emitted
 * into the scoped rule here.
 */
type CheckboxGroupStylesArgs = CheckboxGroupComponentProps & {
  checkboxStyleJson?: CSSProperties | undefined;
};

export const useStyles = createStyles(({ css, cx, prefixCls }, model: CheckboxGroupStylesArgs) => {
  const checkbox = model.checkbox;
  // Background is separated so it can follow the checked-only convention below.
  const customStyle = splitBackgroundProperties(model.checkboxStyleJson);
  // The check mark itself is drawn from the font: the nested set has no font panel, so its size,
  // weight and colour come from the wrapper's font.
  const markSize = isDefined(model.checkboxStyleJson?.fontSize) ? model.checkboxStyleJson.fontSize : addPx(checkbox?.font?.size);
  const checkColor = isDefined(model.checkboxStyleJson?.color) ? model.checkboxStyleJson.color : isNotNullOrWhiteSpace(checkbox?.font?.color) ? checkbox.font.color : '#fff';
  const markWeight = isDefined(model.checkboxStyleJson?.fontWeight) ? model.checkboxStyleJson.fontWeight : checkbox?.font?.weight;

  const checkboxGroup = cx('sha-multi-checkbox', css`
      /* Wrapper set — styles the group container itself. */
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}
      ${fontStyles(model.font, model.styleCss)}

      >.${prefixCls}-checkbox-wrapper {
        height: 100%;
        align-items: center !important;
        ${fontStyles(model.font, model.styleCss)}
      }

      /* Checkbox set — styles the box of each option. */
      .${prefixCls}-checkbox {
        ${isDefined(markSize) ? `--ant-control-interactive-size: ${markSize};` : ''}
        --ant-line-width-bold: ${borderWidthFromWeight(`${markWeight}`)} !important;
        --ant-color-white: ${checkColor} !important;
        ${borderStyles(checkbox?.border)}
        ${shadowStyles(checkbox?.shadow)}
        ${dimensionsStyles(checkbox?.dimensions)}
        ${marginStyles(checkbox?.stylingBoxJson)}
        ${paddingStyles(checkbox?.stylingBoxJson)}

        .${prefixCls}-checkbox-input {
          width: 100%;
          height: 100%;
        }

        &:after {
          top: 50% !important;
          inset-inline-start: 50% !important;
          transform: translate(-50%, -50%) rotate(45deg) scale(0) !important;
        }
        &.${prefixCls}-checkbox-checked:after {
          transform: translate(-50%, -50%) rotate(45deg) scale(1) !important;
        }

        /* Custom style last so it wins over the panel settings above, matching how the
           wrapper's own custom style overrides its panels. Its background declarations are
           held back — see the checked rule below. */
        ${cssPropertiesToString(customStyle.rest)}
      }

      /* Background fills the box only when checked (checkbox convention). The custom style's
         background follows the same rule, so setting one there cannot paint the unchecked box. */
      .${prefixCls}-checkbox-checked {
        ${backgroundStyles(checkbox?.background)}
        ${cssPropertiesToString(customStyle.background)}
      }
    `);

  return {
    checkboxGroup,
  };
});
