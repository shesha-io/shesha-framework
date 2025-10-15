import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const themeParameters = cx(
    'theme-parameters',
    css`
      height: 100%;
      overflow-y: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    `,
  );

  const themeHeader = cx(
    'theme-parameters',
    css`
    font-size: 18px;
    font-weight: 700;
    `,
  );

  return {
    themeParameters,
    themeHeader,
  };
});
