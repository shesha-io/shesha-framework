import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const label = "label";
    const value = "value";
    const innerContainer = "container-inner";

    const flexContainer = cx("flex-container", css`

        width: max-content;
        * {
            margin: 0;
            padding: 0 !important;
            min-height: min-content !important;
            width; 100%;
        }

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
        }

        .${flexItemWrapper} {
            flex-direction: row;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
        }

        .${flexItem} {
            text-align: center;
        }
    `);

    return {
        flexItem, flexItemWrapper, flexItemWrapperVertical, divider, flexContainer, label, value, innerContainer
    };
});