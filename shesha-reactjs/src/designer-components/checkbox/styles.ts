import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';
import { isDefined } from '@/utils/nullables';
import { ICheckboxComponentProps } from './interfaces';
import { dimensionsStyles, backgroundStyles, borderStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

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

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ICheckboxComponentProps) => {
  const width = addPx(model.dimensions?.width);
  const height = addPx(model.dimensions?.height);
  // Font drives the check-mark: size → mark size (antd scales the `:after` off
  // `--ant-control-interactive-size`), weight → mark thickness (`--ant-line-width-bold`),
  // color → mark color (`--ant-color-white`). Dimensions size the box independently.
  const markSize = addPx(model.font?.size);
  const checkColor = isDefined(model.font?.color) && model.font.color !== '' ? model.font.color : '#fff';
  const bgColor = model.background?.type === 'color' ? model.background.color : undefined;

  const checkbox = cx("sha-checkbox", css`
      &.${prefixCls}-checkbox-wrapper {
        height: 100%;
      }

      .${prefixCls}-checkbox {
        ${isDefined(markSize) ? `--ant-control-interactive-size: ${markSize};` : ''}
        --ant-line-width-bold: ${borderWidthFromWeight(model.font?.weight)} !important;
        --ant-color-white: ${checkColor} !important;
        ${isDefined(bgColor) && bgColor !== '' ? `--ant-color-primary-hover: ${bgColor};` : ''}
        ${isDefined(width) ? `width: ${width};` : ''}
        ${isDefined(height) ? `height: ${height};` : ''}
        ${dimensionsStyles(model.dimensions)}
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
    checkbox,
  };
});
