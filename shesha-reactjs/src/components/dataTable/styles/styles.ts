import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const tableErrorContainer = cx("sha-table-error-container", css`
        margin: 12px;
        margin-top: 0;
    
        &:empty {
        margin: unset;
        }    
    `);

    return {
        shaChildTableErrorContainer: tableErrorContainer
    };
});