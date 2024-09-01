import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {

  const flexInput = cx("", css`
      flex: 1 1 100px;
      min-width: 100px;
      width: 100%;
    `);
  const flexWrapper = cx("", css`
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
    `);
  return {
    flexWrapper,
    flexInput
  };
});