import { createStyles } from '@/styles';
import React from 'react';

export const useStyles = createStyles(({ css, cx, prefixCls }, { style }: { style: React.CSSProperties }) => {
  const { fontWeight, backgroundImage, backgroundColor, ...rest } = style;

  const borderWidthFromWeight = (weight): string => {
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

  const checkbox = cx("sha-checkbox", css`
      .${prefixCls}-checkbox {
        .${prefixCls}-checkbox-inner {
            --ant-control-interactive-size: ${style?.fontSize};
            --ant-line-width-bold: ${borderWidthFromWeight(style?.fontWeight)} !important;
            --ant-color-white: ${style.color || '#fff'} !important;
            --ant-color-primary-hover: ${backgroundColor};
            width: ${style?.width};
            height: ${style?.height};
            display: flex;
            justify-content: center;
            ${rest}
            :after {
                inset-inline-start: unset;
            }
            .${prefixCls}-checkbox {

            }
        }
      }

      .${prefixCls}-checkbox-checked {
        .${prefixCls}-checkbox-inner {
            background: ${backgroundImage || backgroundColor};
            ${rest}
           
            .${prefixCls}-checkbox {

                }
            }
        }
    `);

  return {
    checkbox,
  };
});
