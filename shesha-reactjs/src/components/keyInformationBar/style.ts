import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token }) => {
    const flexItem = "flex-item";
    const flexItemWrapper = "flex-item-wrapper";
    const flexItemWrapperVertical = "flex-item-wrapper-vertical";
    const divider = "divider";
    const content = "content";

    const flexContainer = cx("flex-container", css`
        max-width: 100%;
        background-color: ${token.colorTextLightSolid};

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            align-items: center;
            flex-flow: row nowrap;

            .${content} {
                max-width: 100%;
                width: max-content;
                padding: 0;
                white-space: nowrap;
                flex: 1 1;
                .ant-form-item {
                    margin-bottom: 0;
                    width: 100%;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box; 
                }

                &.ant-form-item-control-input-content, .ant-form-item-control-input {
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-height: 0;
                    width: 100%;

                    button {
                        width: 100%;
                    }

                    span {
                        overflow: hidden;
                        display: block;
                        text-overflow: ellipsis;
                    }
                }

                .ant-row {
                    margin: 0;
                    padding: 0;
                
                }
            }
        }

        .${flexItemWrapper} {
            flex-direction: row;
        }

        .${flexItemWrapperVertical} {
            width: max-content;
            flex-direction: column;
        }

        .${divider}{
            min-width: 0;
            min-height: 0;
            max-height: 100%;
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