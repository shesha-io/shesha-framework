import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, prefixCls }) => {

  const flexInput = cx("", css`
      flex: 1 1 100px;
      min-width: 100px;
    `);
  const flexWrapper = cx("", css`
         display: flex;
        flex-wrap: wrap;
        gap: 8px;
        width: 100%;

        .
    `);
  return {
    flexWrapper,
    flexInput
  };
});