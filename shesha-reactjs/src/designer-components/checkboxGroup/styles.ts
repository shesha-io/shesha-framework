import { createStyles } from '@/styles';
import { CheckboxGroupComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { addPx } from '@/utils/style';

/**
 * Applies the configured Appearance styles (Check Mark, Dimensions, Border,
 * Background, Shadow, Margin & Padding) to every checkbox rendered inside the
 * group. The emotion class is placed on the antd Checkbox.Group root, so the
 * style builders are scoped to each `.ant-checkbox-inner` descendant — that is
 * what makes the styling apply per checkbox rather than to the whole group.
 * Mirrors the standalone Checkbox component so both look consistent.
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
  const markSize = addPx(model.font?.size);
  const checkColor = isNotNullOrWhiteSpace(model.font?.color) ? model.font.color : '#fff';
  const bgColor = model.background?.type === 'color' ? model.background.color : undefined;

  const checkboxGroup = cx('sha-multi-checkbox', css`
      ${dimensionsStyles(model.dimensions)}
      >.${prefixCls}-checkbox-wrapper {
        height: 100%;
        align-items: center !important;
      }

      .${prefixCls}-checkbox {
        ${isDefined(markSize) ? `--ant-control-interactive-size: ${markSize};` : ''}
        --ant-line-width-bold: ${borderWidthFromWeight(model.font?.weight)} !important;
        --ant-color-white: ${checkColor} !important;
        ${isNotNullOrWhiteSpace(bgColor) ? `--ant-color-primary-hover: ${bgColor};` : ''}
        ${borderStyles(model.border)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}

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
        ${backgroundStyles(model.background)}
        ${borderStyles(model.border)}
      }
    `);

  return {
    checkboxGroup,
  };
});
