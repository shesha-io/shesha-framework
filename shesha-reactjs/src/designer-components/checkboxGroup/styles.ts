import { createStyles } from '@/styles';
import { CheckboxGroupComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
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
  const option = model.option;
  const markSize = addPx(option?.font?.size);
  const checkColor = isNotNullOrWhiteSpace(option?.font?.color) ? option.font.color : '#fff';
  const bgColor = option?.background?.type === 'color' ? option.background.color : undefined;

  const checkboxGroup = cx('sha-multi-checkbox', css`
      /* Wrapper set — styles the group container itself. */
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}

      >.${prefixCls}-checkbox-wrapper {
        height: 100%;
        align-items: center !important;
      }

      /* Option set — styles each checkbox. */
      .${prefixCls}-checkbox {
        ${isDefined(markSize) ? `--ant-control-interactive-size: ${markSize};` : ''}
        --ant-line-width-bold: ${borderWidthFromWeight(option?.font?.weight)} !important;
        --ant-color-white: ${checkColor} !important;
        ${isNotNullOrWhiteSpace(bgColor) ? `--ant-color-primary-hover: ${bgColor};` : ''}
        ${borderStyles(option?.border)}
        ${shadowStyles(option?.shadow)}
        ${dimensionsStyles(option?.dimensions)}
        ${paddingStyles(option?.stylingBoxJson)}

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
        ${backgroundStyles(option?.background)}
        ${borderStyles(option?.border)}
      }
    `);

  return {
    checkboxGroup,
  };
});
