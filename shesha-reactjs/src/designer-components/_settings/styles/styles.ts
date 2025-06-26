import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, token }) => {

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
        ${responsive.mobile} {
            margin-left: 28px;
        }

        // special style when inside the sidebar
        .sidebar-container & {
            margin-right: 0;
        }
    `);

    const label = cx("properties-label", css`
            font-size: 12px;
            color: darkslategrey;
            font-weight: 500;
            position: relative;
            
            +.ant-form-item-tooltip {
            align-self: end !important;
            position: relative;
            bottom: -2px;
            margin-right: 8px;
            }

            +.sha-required-mark {
                position: relative;
                bottom: -8px;
            }
    `);

    const bindingOptionsBtn = cx(css`
        top: -8px;
        `);
    const jsSwitch = cx(css`
            position: absolute;
            right: 0;
            top: 4px;
            font-size: 12px;
            height: 20px;
            max-width: 100%;
            margin-left: 5px;
            margin-right: 0px;
            color: ${token.colorPrimary};
            display: flex;
            justify-content: center;
            align-items: center;
            ${responsive.mobile} {
                right: 0;
                left: auto;
                top: -25px;
            }

            // special style when inside the sidebar
            .sidebar-container & {
                right: 0;
                left: auto;
                top: -25px;
            }
            .${sheshaStyles.verticalSettingsClass} & {
                right: 0;
                left: auto;
                top: -25px;
            }
        
    `);

    return {
        contentJs,
        contentCode,
        jsContent,
        label,
        bindingOptionsBtn,
        jsSwitch
    };
});