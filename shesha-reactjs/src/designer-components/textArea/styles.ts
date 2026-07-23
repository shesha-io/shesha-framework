import { createStyles } from '@/styles';
import { ITextAreaComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: ITextAreaComponentProps) => {
  const textArea = cx('sha-text-area', css`
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}

      &.ant-input,
      .ant-input {
        ${fontStyles(model.font)}
      }
  `);

  return {
    textArea,
  };
});
