import { createStyles, sheshaStyles } from '@/styles';

interface RefListStatusStyleProps {
  dimensionsStyles: Record<string, unknown>;
  fontStyles: { fontSize?: string | number; fontWeight?: string | number; textAlign?: string };
  readOnly?: boolean;
}

export const useStyles = createStyles(({ css, cx }, { dimensionsStyles, fontStyles, readOnly }: RefListStatusStyleProps) => {
  const shaStatusTag = 'sha-status-tag';
  const shaStatusTagContainer = cx(
    'sha-status-tag-container',
    css`
      display: flex;
      align-items: center;
      width: fit-content;
      margin: ${readOnly ? '0 ' + sheshaStyles.paddingLG + 'px' : '0'} !important;
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
