import { createStyles, sheshaStyles } from '@/styles';
import { CSSProperties } from 'react';

export interface RefListStatusStyleProps {
  dimensionsStyles?: {
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
    minHeight?: CSSProperties['minHeight'];
    minWidth?: CSSProperties['minWidth'];
    maxHeight?: CSSProperties['maxHeight'];
    maxWidth?: CSSProperties['maxWidth'];
  };
  fontStyles?: {
    fontSize?: CSSProperties['fontSize'];
    fontWeight?: CSSProperties['fontWeight'];
    textAlign?: CSSProperties['textAlign'];
  };
  readOnly?: boolean;
}

export const useStyles = createStyles(({ css, cx }, props: RefListStatusStyleProps) => {
  const { dimensionsStyles, fontStyles, readOnly } = props;

  const shaStatusTag = 'sha-status-tag';
  const shaStatusTagContainer = cx(
    'sha-status-tag-container',
    css`
      display: flex;
      align-items: center;
      width: fit-content;
      ${dimensionsStyles};

      > span {
        ${dimensionsStyles};
      }

      .${shaStatusTag} {
        margin: ${readOnly ? `0 ${sheshaStyles.paddingLG}px` : '0'} !important;
        text-transform: uppercase;
        display: flex;
        width: 100%;
        justify-content: ${fontStyles.textAlign === 'center' ? 'center' : fontStyles.textAlign === 'right' ? 'flex-end' : 'flex-start'};
        align-items: center;
        text-align: center;
        align-self: center;
        ${fontStyles}


        .sha-help-icon {
          cursor: help;
          font-size: 14px;
          color: #ad393981;
        }
      }
    `
  );

  return {
    shaStatusTagContainer,
    shaStatusTag,
  };
});
