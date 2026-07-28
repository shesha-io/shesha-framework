import { createStyles } from '@/styles';
import { CheckboxGroupComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

/**
 * Applies the configured Appearance styles (Check Mark, Dimensions, Border,
 * Background, Shadow, Margin & Padding) to every checkbox rendered inside the
 * group. The emotion class is placed on the antd Checkbox.Group root, so the
 * style builders are scoped to each `.ant-checkbox-inner` descendant — that is
 * what makes the styling apply per checkbox rather than to the whole group.
 * Mirrors the standalone Checkbox component so both look consistent.
 */
export const useStyles = createStyles(({ css, cx, prefixCls }, model: CheckboxGroupComponentProps) => {
  const checkboxGroup = cx('sha-multi-checkbox', css`
      .${prefixCls}-checkbox {
        input {
          width: 100%;
          height: 100%;
        }

        .${prefixCls}-checkbox-inner {
          display: flex;
          justify-content: center;
          ${fontStyles(model.font)}
          ${dimensionsStyles(model.dimensions)}
          ${borderStyles(model.border)}
          ${backgroundStyles(model.background)}
          ${shadowStyles(model.shadow)}
          ${paddingStyles(model.stylingBoxJson)}

          &::after {
            inset-inline-start: unset;
          }
        }
      }

      .${prefixCls}-checkbox-checked {
        .${prefixCls}-checkbox-inner {
          ${backgroundStyles(model.background)}
          ${borderStyles(model.border)}
        }
      }
    `);

  return {
    checkboxGroup,
  };
});
