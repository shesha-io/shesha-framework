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

         display: flex;
         align-items: center;
         width: 100%;
         max-width: 100%;
         height: 35px;
         max-height: max-content;
         overflow: hidden;

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            justify-content: center;
            align-items: center;
            width: max-content;
            height: 100%;
        }

        .${flexItemWrapper} {
            flex-direction: row;
            min-width: 150px;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
            min-width: 50px;
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

        .sha-component {
            text-align: center;
        }
        .${flexItem} {
            text-align: center;
        }

        .${divider} {
            margin: 0;
            height: 100%;
        }
    `);

    return {
        flexItem, flexItemWrapper, flexItemWrapperVertical, divider, flexContainer, label, value, innerContainer
    };
});