import { createStyles } from '@/styles';
import { ILinkComponentProps } from './interfaces';
import { dimensionsStyles, fontStyles, paddingStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils';

const shaLink = 'sha-link';

export const useStyles = createStyles(({ css, cx }, model: ILinkComponentProps) => {
  const shaLinkContainer = cx('sha-link-container', css`
      ${model.direction === 'horizontal'
          ? `
          display: flex;
          ${isDefined(model.justifyContent) ? `justify-content: ${model.justifyContent};` : ''}
          ${isDefined(model.alignItems) ? `align-items: ${model.alignItems};` : ''}
          ${isDefined(model.justifyItems) ? `justify-items: ${model.justifyItems};` : ''}
          `
          : ''
      }
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}
  `);

  const shaLinkWrapper = cx('sha-link-wrapper', css`
      display: flex;
      height: 100%;
      align-items: center;

      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}

      .${shaLink} {
        ${fontStyles(model.font)}
        height: unset;
      }
  `);

  return {
    shaLinkContainer,
    shaLinkWrapper,
    shaLink,
  };
});
