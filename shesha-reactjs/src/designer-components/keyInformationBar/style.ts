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
            align-items: center;

            .${content} {
                max-width: 100%;
                width: max-content;
                padding: 0;
                white-space: nowrap;

                .ant-form-item {
                    margin-bottom: 0;
                    overflow: hidden;
                    max-width: 100%;
                    justify-content: center;
                    text-overflow: ellipsis;
                }

                &.ant-form-item-control-input-content, .ant-form-item-control-input {
                    text-overflow: ellipsis;
                    white-space: nowrap;
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