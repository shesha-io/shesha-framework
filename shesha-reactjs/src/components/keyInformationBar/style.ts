import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const content = "content";

    const flexContainer = cx("flex-container", css`
        background-color: ${token.colorTextLightSolid};
        flex-wrap: wrap;

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            min-width: 0px;
            box-sizing: border-box;
            flex: 1;
            
            .${content} {
                width: 100%;
                padding: 0;
                overflow: hidden;
                flex: 1;
                .ant-form-item-control-input {
                    min-height: 0;
                }       

                span {
                    min-width: 15px;
                    overflow: hidden;
                }

            }
        }

        .${flexItemWrapper} {
            flex-direction: row;
        }

        .${flexItemWrapperVertical} {
            flex-direction: column;
        }

        .${divider}{
            max-height: 100%;
            max-width: 100%;
            flex-shrink: 0;
            flex-grow: 0;
        }
    `);

    return {
        flexContainer,
        flexItem,
        flexItemWrapper,
        flexItemWrapperVertical,
        divider,
        content,
    };
});