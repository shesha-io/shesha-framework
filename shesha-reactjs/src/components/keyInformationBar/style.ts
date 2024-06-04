import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const label = "label";
    const value = "value";

    const flexContainer = cx("flex-container", css`

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            justify-content: center;
            align-items: center;
            width: max-content;
        }

        .${flexItemWrapper} {
            flex-direction: row;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
        }

        .${flexItem} {
            text-align: center;
            display: flex;
            flex-direction: column;
            height: 50px;
        }

        .${divider} {
            margin: 0;
            height: 100%;
        }
    `);

    return {
        flexItem, flexItemWrapper, flexItemWrapperVertical, divider, flexContainer, label, value
    };
});