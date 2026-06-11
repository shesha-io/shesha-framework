import { createStyles } from '@/styles';
import { CSSObject } from 'antd-style';

type StylesArgs = {
  dimensionsStyles: CSSObject;
  fontStyles: CSSObject;
};

type StylesResponse = {
  shaStatusTagContainer: string;
  shaStatusTag: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx }, { dimensionsStyles, fontStyles }) => {
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${shaStatusTag} {
        text-transform: uppercase;
        display: flex;
        width: 100%;
        justify-content: ${fontStyles.textAlign === 'center' ? 'center' : fontStyles.textAlign === 'right' ? 'flex-end' : 'flex-start'};
        align-items: center;
        text-align: center;
        align-self: center;
        ${fontStyles}
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;


        .sha-help-icon {
          cursor: help;
          font-size: 14px;
          color: #ad393981;
        }
      }
    `,
  );

  return {
    shaStatusTagContainer,
    shaStatusTag,
  };
});
