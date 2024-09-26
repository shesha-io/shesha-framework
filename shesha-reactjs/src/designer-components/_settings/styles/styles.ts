import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, prefixCls }) => {

    const jsSwitch = cx(css`
        &.${prefixCls}-btn {
            margin-right: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: lightslategrey;
            max-width: 100%;
            ${responsive.mobile} {
                right: 0;
                left: auto;
                top: -28px;
            }

            // special style when inside the sidebar
            .sidebar-container & {
                right: 0;
                left: auto;
            }
            .${sheshaStyles.verticalSettingsClass} & {
                right: 0;
                left: auto;
                top: -28px;
            }
        }
    `);

    const contentJs = cx(css`
        position: relative;
        top: 0px;
        width: 100%;
    `);
    const contentCode = cx(css`
        position: relative;
        top: 0px;
        ${responsive.mobile} {
            padding-top: 4px;
        }
        .${sheshaStyles.verticalSettingsClass} & {
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
            display: flex;
        }
        .${sheshaStyles.verticalSettingsClass} & {
            margin-right: 0;
            margin-left: 0;
        }
    `);

    const unitSelector = cx(css`
        .ant-select-selector {
        padding: 1px 2px !important;
    }
        .ant-select-arrow {
            margin-left: 2px !important;
        }
    `);

    return {
        jsSwitch,
        contentJs,
        contentCode,
        jsContent,
        unitSelector
    };
});