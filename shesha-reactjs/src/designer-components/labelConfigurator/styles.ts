import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, token }) => {
  const flexWrapper = css`
        display: flex;
        flex-direction: row;
        gap: 8px;
        position: absolute;
        justify-content: flex-end;
        right: 36px;
        top: 4px;
        z-index: 2;
    `;

  const hideLabelIcon = css`
    cursor: pointer;
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimary};
    `;

  const formItem = css`

      .sha-js-label {
        margin: 0px !important;
      }

      .ant-form-item-control-input {
        min-height: 0px !important;
      }
    `;

  return {
    flexWrapper,
    hideLabelIcon,
    formItem,
  };
});
