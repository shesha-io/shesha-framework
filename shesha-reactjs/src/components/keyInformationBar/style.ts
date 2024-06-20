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
            min-width: 0px;
            box-sizing: border-box;
            flex: 1;

            .ant-form-item {
                max-width: 100%;
                min-width: 14px;
            }
            
            .${content} {
                width: 100%;
                padding: 0;
                white-space: nowrap;
                overflow: hidden;
                
                .ant-form-item-control-input {
                    min-height: 0;
                }
                .entity-reference-btn {
                    max-width: 130%;
                    margin: 0;
                }        

                span {
                    display: block;
                    min-width: 15px;
                    width: 100%;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }

                .sha-component {
                    margin: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }

                .sha-drop-hint {
                    white-space: normal;
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