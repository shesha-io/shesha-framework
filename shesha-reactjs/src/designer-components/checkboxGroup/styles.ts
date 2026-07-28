import { createStyles } from '@/styles';
import { CSSObject } from 'antd-style';
import { CSSProperties } from 'react';

/**
 * Applies the configured Appearance styles (Check Mark, Dimensions, Border,
 * Background, Shadow, Margin & Padding) to every checkbox rendered inside the
 * group. Mirrors the single Checkbox component's styling so that a Checkbox
 * Group and a standalone Checkbox look consistent.
 */
export const useStyles = createStyles(({ css, cx, prefixCls }, { style }: { style: CSSProperties }) => {
  const { fontWeight, backgroundImage, backgroundColor, ...rest } = style;

  const borderWidthFromWeight = (weight: CSSProperties['fontWeight'] | undefined): string => {
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
    };
  };

  const checkboxGroup = cx('sha-multi-checkbox', css`
      .${prefixCls}-checkbox {
        input {
          width: 100%;
          height: 100%;
        }
        .${prefixCls}-checkbox-inner {
            --ant-control-interactive-size: ${style.fontSize};
            --ant-line-width-bold: ${borderWidthFromWeight(style.fontWeight)} !important;
            --ant-color-white: ${style.color || '#fff'} !important;
            --ant-color-primary-hover: ${backgroundColor};
            width: ${style.width};
            height: ${style.height};
            display: flex;
            justify-content: center;
            ${(backgroundImage || backgroundColor) ? `background: ${backgroundImage || backgroundColor};` : ''}
            ${rest as CSSObject}
            :after {
                inset-inline-start: unset;
            }
        }
      }

      .${prefixCls}-checkbox-checked {
        .${prefixCls}-checkbox-inner {
            ${(backgroundImage || backgroundColor) ? `background: ${backgroundImage || backgroundColor};` : ''}
            ${rest as CSSObject}
            }
        }
    `);

  return {
    checkboxGroup,
  };
});
