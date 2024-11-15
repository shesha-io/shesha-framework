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

    const label = cx(css`
            font-size: 12px;
            max-height: 28px;
            color: darkslategrey;
            font-weight: 500;
            position: relative;
            top: 6px;

            +.ant-form-item-tooltip {
            align-self: end !important;
            }
    `);


    return {
        jsSwitch,
        contentJs,
        contentCode,
        jsContent,
        label
    };
});