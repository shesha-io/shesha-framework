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
        }

        .${flexItemWrapper} {
            flex-direction: row;
            width: 100%;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
            width: 25%;
        }

        .${flexItem} {
            text-align: center;
            display: flex;
            width: 100%;
            flex-direction: column;
            flex-grow: 1;
        }
    
        .${label}, ${value} {
            text-align: center;
            width: 100%;
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