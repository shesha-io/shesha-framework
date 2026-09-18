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
            color: ${token.colorTextSecondary};
            font-weight: 500;
            position: relative;
            /* Long labels ("Interaction Mode") used to run into the control below them in a narrow
               settings column. Keeping them on one line and letting the overflow ellipsise means the
               row keeps its height and the icons underneath stay clear of the text. */
            line-height: 20px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;


            +.ant-form-item-tooltip {
            align-self: center !important;
            position: relative;
            top: 0;
            }
    `);

  const jsSwitch = cx(css`
            position: absolute;
            right: 0;
            /* The button is 20px tall and sits against a 20px label line; anchoring it to the top of that
               line rather than 4px into it is what puts the JS icon level with the label text. */
            top: 0;
            font-size: 12px;
            height: 20px;
            line-height: 1;
            padding: 0;
            max-width: 100%;
            margin-left: 5px;
            margin-right: 0px;
            color: ${token.colorPrimary};
            display: inline-flex;
            justify-content: center;
            align-items: center;

            .anticon {
              display: block;
              line-height: 1;
            }
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
    textarea,
    textarea:hover,
    textarea:focus,
    input,
    input:hover,
    input:focus,
    .properties-label,
    .ant-input-number,
    .ant-select,
    .ant-switch-handle:before,
    .ant-input-affix-wrapper,
    .ant-radio-button-wrapper-checked,
    .ant-color-picker-trigger
  `;

  /* antd renders the editable text in a nested node whose own rule is more specific than a bare
     `input`, so the wrapper's colour never reaches it. These need the text colour only - the
     wrapper above already paints the background, and repainting it here would double the tint. */
  const nestedTextSelectors = `
    .ant-input-number .ant-input-number-input,
    .ant-select .ant-select-content,
    .ant-select .ant-select-selection-item,
    /* AutoComplete (dimension fields) keeps its value in a real input that overrides
       .ant-select-content. */
    .ant-select .ant-select-input,
    .ant-input-affix-wrapper > input.ant-input
  `;

  const isDarkMode = token.colorBgBase === '#000';
  const inheritedBg = isDarkMode ? token.colorSuccessBg : '#D7E8D9';
  const overriddenBg = isDarkMode ? token.colorWarningBg : '#F4E9D6';

  const inheritedValue = cx(css`
    ${valueHighlightSelectors} {
      background-color: ${inheritedBg};
    }

    ${nestedTextSelectors} {
      background-color: transparent;
    }
  `);

  const overriddenValue = cx(css`
    ${valueHighlightSelectors} {
      background-color: ${overriddenBg};
    }

    ${nestedTextSelectors} {
      background-color: transparent;
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
