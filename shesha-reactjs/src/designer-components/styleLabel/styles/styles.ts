import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {

  const flexInput = cx("", css`
      // flex: 1 1 100px;
    `);
  const flexWrapper = cx("", css`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        position: absolute;
        right: 30px;
        top: -28px;
    `);

  const hidelLabelIcon = cx("", css`
    cursor: pointer;
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