import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const shaGlobalEmptyState = cx(
    'sha-global-empty-state',
    css`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin: 30px;

    .sha-icon {
      font-size: 30px;
    }

    .no-data-title {
      font-size: 15px;
      margin: 0;
      margin-top: 0px;
    }

    .no-data-paragraph {
      margin: 0;
      margin-top: 5px;
      font-size: 14px
    }
    `,
  );
  return {
    shaGlobalEmptyState,
  };
});
