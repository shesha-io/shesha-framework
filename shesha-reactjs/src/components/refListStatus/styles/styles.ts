import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { dimensionsStyles, fontStyles }) => {

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
