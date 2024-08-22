import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {

  const flexInput = cx("", css`
      flex: 1 1 100px;
      min-width: 100px;
    `);
  const flexWrapper = cx("", css`
         display: flex;
        flex-wrap: wrap;
        gap: 8px;
        width: 100%;
    `);

  const hidelLabelIcon = cx("", css`
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimary};
    `);
  return {
    flexWrapper,
    flexInput,
    hidelLabelIcon
  };
});