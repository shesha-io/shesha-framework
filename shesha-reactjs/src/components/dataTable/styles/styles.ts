import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const shaFormCell = cx("sha-form-cell", css`
      width: 100%;

      .ant-form-item-control {
        flex-direction: unset;
        display: flex;
        text-wrap: wrap;
      }
    `);

    const tableErrorContainer = cx("sha-table-error-container", css`
        margin: 12px;
        margin-top: 0;
    
        &:empty {
        margin: unset;
        }    
    `);

    return {
        shaChildTableErrorContainer: tableErrorContainer,
        shaFormCell,
    };
});