import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, token }) => {
  const formItem = cx(css`
    margin: 0px !important;

    > label {
      height: auto !important; 
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
            top: 4px;
            }
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

  const valueHighlightSelectors = `
    input, textarea,
    .properties-label,
    .ant-select-selector,
    .ant-switch-handle:before,
    .ant-input-affix-wrapper,
    .ant-radio-button-wrapper-checked
  `;

  const inheritedValue = cx(css`
    ${valueHighlightSelectors} {
      background-color: #D7E8D9 !important;
      color: #1C1B1F !important;
    }
  `);

  const overriddenValue = cx(css`
    ${valueHighlightSelectors} {
      background-color: #F4E9D6 !important;
      color: #1C1B1F !important;
    }
  `);

  return {
    contentJs,
    contentCode,
    jsContent,
    label,
    jsSwitch,
    formItem,
    inheritedValue,
    overriddenValue,
  };
});
