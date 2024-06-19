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
        flex-wrap: wrap;

        .${flexItemWrapper}, .${flexItemWrapperVertical} {
            display: flex;
            align-items: center;
            flex: 0 0 33.3333%;

            .${content} {
                width: max-content;
                padding: 0;
                white-space: nowrap;
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
                        max-width: 100%;
                    }

                    span {
                        overflow: hidden;
                        display: block;
                        text-overflow: ellipsis;
                        width: inherit;
                    }
                }

                .ant-row {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                
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
            max-width: 100%;
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