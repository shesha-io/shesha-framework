import { createStyles } from '@/styles';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { ISwitchComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ISwitchComponentProps) => {
  // Background colours the track when the switch is checked (switch convention: the unchecked
  // track keeps the antd default so the two states stay distinguishable). Font drives the handle
  // colour and the inner label text; dimensions/border/shadow/padding size the track itself.
  const handleColor = model.font?.color;
  const handleSize = model.font?.size;

  const switchStyles = cx('sha-switch', css`
      &.${prefixCls}-switch {
        ${dimensionsStyles(model.dimensions)}
        ${borderStyles(model.border)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}

        .${prefixCls}-switch-handle::before {
          ${!isNullOrWhiteSpace(handleColor) ? `background-color: ${handleColor};` : ''}
          ${!isNullOrWhiteSpace(handleSize) ? `` : ''}
        }

        .${prefixCls}-switch-inner {
          ${fontStyles(model.font)}
        }
      }

      /* Track fills only when checked, so the off state stays visually distinct. */
      &.${prefixCls}-switch.${prefixCls}-switch-checked {
        ${backgroundStyles(model.background)}
        ${borderStyles(model.border)}
      }
    `);

  return {
    switchStyles,
  };
});
