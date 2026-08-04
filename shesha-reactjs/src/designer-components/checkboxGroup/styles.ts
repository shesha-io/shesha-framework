import { createStyles } from '@/styles';
import { CheckboxGroupComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
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

export const useStyles = createStyles(({ css, cx, prefixCls }, model: CheckboxGroupComponentProps) => {
  const checkbox = model.checkbox;
  // The check mark itself is drawn from the font: the nested set has no font panel, so its size,
  // weight and colour come from the wrapper's font.
  const markSize = addPx(checkbox?.font?.size);
  const checkColor = isNotNullOrWhiteSpace(checkbox?.font?.color) ? checkbox.font.color : '#fff';

  const checkboxGroup = cx('sha-multi-checkbox', css`
      /* Wrapper set — styles the group container itself. */
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}
      ${marginStyles(model.stylingBoxJson)}
      ${fontStyles(model.font)}

      >.${prefixCls}-checkbox-wrapper {
        height: 100%;
        align-items: center !important;
        ${fontStyles(model.font)}
      }

      /* Checkbox set — styles the box of each option. */
      .${prefixCls}-checkbox {
        ${isDefined(markSize) ? `--ant-control-interactive-size: ${markSize};` : ''}
        --ant-line-width-bold: ${borderWidthFromWeight(checkbox?.font?.weight)} !important;
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
      }

      /* Background fills the box only when checked (checkbox convention). */
      .${prefixCls}-checkbox-checked {
        ${backgroundStyles(checkbox?.background)}
      }
    `);

  return {
    checkboxGroup,
  };
});
