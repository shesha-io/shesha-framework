import { createStyles, sheshaStyles } from '@/styles';
import { CSSObject } from 'antd-style';

type StylesArgs = {
  dimensionsStyles: CSSObject;
  fontStyles: CSSObject;
  readOnly?: boolean;
};

type StylesResponse = {
  shaStatusTagContainer: string;
  shaStatusTag: string;
  shaStatusTagDisabled: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx }, { dimensionsStyles, fontStyles, readOnly }) => {
  const shaStatusTag = 'sha-status-tag';
  const shaStatusTagContainer = cx(
    'sha-status-tag-container',
    css`
      display: flex;
      align-items: center;
      width: fit-content;
      margin: ${readOnly ? `0 ${sheshaStyles.paddingLG}px` : '0'} !important;
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

  // Disabled greys the tag out and removes it from the tab order — distinct from read-only, which
  // keeps the value fully legible.
  const shaStatusTagDisabled = cx(
    'sha-status-tag-disabled',
    css`
      && {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    `,
  );

  return {
    shaStatusTagContainer,
    shaStatusTag,
    shaStatusTagDisabled,
  };
});
