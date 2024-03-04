import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const shaStatusTag = 'sha-status-tag';
  const shaStatusTagContainer = cx(
    'sha-status-tag-container',
    css`
      display: flex;
      align-items: center;
      width: fit-content;

      .${shaStatusTag} {
        text-transform: uppercase;
        display: flex;
        width: 100%;
        justify-content: flex-start;
        align-items: center;
        text-align: center;
        align-self: center;

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
