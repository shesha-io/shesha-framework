import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, responsive, prefixCls }) => {
    const verticalSettings = "vertical-settings";
    const jsSwitch = cx(css`
        &.${prefixCls}-btn {
            position: absolute;
            left: 0;
            right: auto;
            top: 4px;
            font-size: 12px;
            height: 20px;
            width: 2.5rem;
            margin-left: 5px;
            margin-right: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            ${responsive.mobile} {
                right: 0;
                left: auto;
                top: -28px;
            }

            // special style when inside the sidebar
            .sidebar-container & {
                right: 0;
                left: auto;
                top: -28px;
            }
            .${verticalSettings} & {
                right: 0;
                left: auto;
                top: -28px;
            }
        }
    `);

    const contentJs = cx(css`
        position: relative;
        top: 0px;
    `);
    const contentCode = cx(css`
        position: relative;
        top: 0px;
        ${responsive.mobile} {
            padding-top: 4px;
        }

        // special style when inside the sidebar
        .sidebar-container & {
            padding-top: 4px;
        }
        .${verticalSettings} & {
            padding-top: 4px;
        }
    `);
    const jsContent = cx(css`
        margin-left: 64px;
        ${responsive.mobile} {
            margin-left: 0;
        }

        // special style when inside the sidebar
        .sidebar-container & {
            margin-right: 0;
            margin-left: 0;
        }
        .${verticalSettings} & {
            margin-right: 0;
            margin-left: 0;
        }
    `);

    return {
        jsSwitch,
        contentJs,
        contentCode,
        jsContent,
        verticalSettings,
    };
});