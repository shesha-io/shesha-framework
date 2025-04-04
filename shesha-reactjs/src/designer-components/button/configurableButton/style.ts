import { createStyles } from "@/styles";

export const useStyles = createStyles(({ css, cx }) => {
    const configurableButton = cx("flex-container", css`
        .sha-toolbar-btn-configurable {
          display: flex;
          align-items: center;
            max-width: 100%;
            span {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
        }
       
    }
    `);
    return {
        configurableButton,
    };
});