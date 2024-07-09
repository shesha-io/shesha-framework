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
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                overflow: hidden;
                .ant-form-item-control-input {
                    min-height: 0;
                }

                * {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                span, div {
                    min-width: 15px;
                    display: block;
                    width: 100%;
                }
                
                .ant-typography {
                    margin: unset !important;
                    padding: 0px !important;
                    display: block !important;
                    place-items: unset !important;
                    grid: none !important;
                }
                    
                &.ant-form-item-control-input-content, .ant-form-item-control-input {
                    min-height: 0;
                    width: 100%;
                }

                button {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
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