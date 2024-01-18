import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const entityReferenceBtn = cx("entity-reference-btn", css`
        padding: unset !important;
    `);
    return {
        entityReferenceBtn,
    };
});