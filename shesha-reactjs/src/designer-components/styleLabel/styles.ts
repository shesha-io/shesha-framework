import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {
  const flexWrapper = cx("", css`
        display: flex;
        flex-direction: row;
        gap: 8px;
        position: relative;
        justify-content: flex-end;
        right: 30px;
        top: 32px;
        z-index: 2;
    `);

  const hidelLabelIcon = cx("", css`
    cursor: pointer;
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimary};
    `);

  const formItem = cx("", css`
      .ant-form-item {
        margin: 0px !important;
      }
      .sha-js-label {
        margin: 0px !important;
      }

      .ant-form-item-control-input {
        min-height: 0px !important;
      }
    `);

  return {
    flexWrapper,
    hidelLabelIcon,
    formItem,
  };
});
