import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const content = "content";

    const flexContainer = cx("flex-container", css`
    
        width: 100%;

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            .${content} {
                width: 100%;
                * {
                    margin: 0 !important;
                    padding: 0 !important;
                }

                & > sha-component {
                    min-width: 0;
                }
            }
        }

        .${flexItemWrapper} {
            flex-direction: row;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
        }
    `);

    return {
        flexItem, flexItemWrapper, flexItemWrapperVertical, divider, flexContainer, content
    };
});