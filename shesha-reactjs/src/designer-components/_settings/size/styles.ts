import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, prefixCls }) => {
    const container = cx(css`
        max-width: 300px;
        min-width: 150px;

        * {
        font-size: 12px;
        }

        .ant-radio-button-wrapper {
        padding: 0 11px !important;
        }

        .ant-color-picker-trigger {
        width: 24px;
        height: 24px;
        }

        .ant-input-number{
       
            width: 50px;
            height: 24px;
        }
    `);

    const input = cx(css`
        .ant-input {
        width: 50px;
        height: 24px;
        font-size: 12px;
        }

        .ant-select-dropdown {
            padding: 0 4px !important;
            background:red;
        }

        .ant-select-selector {
            padding: 0 4px !important;
            }
            
        .ant-input-group {
            width: auto !important; 
        }
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
        }
        .${sheshaStyles.verticalSettingsClass} & {
            margin-right: 0;
            margin-left: 0;
        }
    `);

    return {
        container,
        input,
        contentCode,
        jsContent,
    };
});