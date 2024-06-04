import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const label = "label";
    const value = "value";

    const flexContainer = cx("flex-container", css`

        width: 100%;

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            align-items: right;
        }

        .${flexItemWrapper} {
            flex-direction: row;
            min-width: 150px;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
            min-width: max-content;
            width: max-content;
        }

        .sha-components-container-inner {
            flex-direction: column;
            min-width: 150px;
            * {
                margin: 0 !important;
                padding: 0 !important;
                min-height: min-content !important;
                width: 100% !important;
            }
        }

        .${flexItem} {
            text-align: center;
        }

        .${divider} {
            margin: 0;
            height: 80%;
        }
    `);

    return {
        flexItem, flexItemWrapper, flexItemWrapperVertical, divider, flexContainer, label, value
    };
});