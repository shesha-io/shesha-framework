import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, prefixCls, token }) => {

    const jsSwitch = cx(css`
        position: absolute;
        &.${prefixCls}-btn {
            margin-right: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: ${token.colorPrimary};
            max-width: 100%;
            ${responsive.mobile} {
                right: auto;
                left: 0;
            }

            // special style when inside the sidebar
            .sidebar-container & {
                right: auto;
                left: 0;
            }
        }
    `);

    const contentJs = cx(css`
        position: relative;
        top: 0px;
    `);


    const inlineInputs = cx(css`
        align-items: end !important;
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
    `);

    const rowInputs = cx(css`
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
        `);

    const contentCode = cx(css`
        position: relative;
        top: 0px;
        ${responsive.mobile} {
            padding-top: 4px;
        }

    `);

    const jsContent = cx(css`
        position: relative;
        margin-left: 28px;
        ${responsive.mobile} {
            margin-left: 28px;
        }

        // special style when inside the sidebar
        .sidebar-container & {
            margin-left: 28px;
            margin-right: 0;
        }
    `);

    const unitSelector = cx(css`
        .ant-select-selector {
        padding: 0 !important;
        padding-inline-end: 5px !important;
        align-self: auto !important;
        line-height: auto !important;
        align-self: top !important;
        padding-left: 0 !important;
    }
    `);

    return {
        jsSwitch,
        contentJs,
        contentCode,
        jsContent,
        unitSelector,
        inlineInputs,
        rowInputs
    };
});