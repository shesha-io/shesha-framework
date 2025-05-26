import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, { styles, colors, activeStepStyle }) => {
  const shaWizardContainer = "sha-wizard-container";
  const shaStepsContent = "sha-steps-content";
  const shaStepsButtonsContainer = "sha-steps-buttons-container";
  const shaStepsButtons = "sha-steps-buttons";

  const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = colors;
  const { color, ...rest } = styles;
  const shaWizard = cx("sha-wizard", css`

    .ant-steps-item-container {
      --ant-color-primary: ${primaryBgColor};
      --ant-color-text-description: ${color}75;
      --ant-color-text: ${color};
      --ant-font-size: calc(${styles.fontSize}/1.3);
      --ant-font-size-lg: ${styles.fontSize || 16};
      --ant-steps-nav-arrow-color: ${color}45;
      --ant-steps-finish-icon-bg-color: ${primaryBgColor}45;
      --ant-color-text-light-solid: ${primaryTextColor} !important;

      * {
        font-family: ${styles.fontFamily};
      }
    }
      
    .ant-steps-item-active {
            --ant-color-text-description: ${activeStepStyle.color || color}75;
            --ant-color-text: ${activeStepStyle.color || color};
            --ant-font-size: calc(${activeStepStyle.fontSize || styles.fontSize}/1.3);
            --ant-font-size-lg: ${activeStepStyle.fontSize || styles.fontSize || 16};

            * {
              font-family: ${activeStepStyle.fontFamily || styles.fontFamily};
            }
      }

    .sha-steps-buttons-container {
      .ant-btn-default {
        ${secondaryBgColor && `--ant-button-default-bg: ${secondaryBgColor} !important`};
        ${secondaryTextColor && `--ant-button-default-color: ${secondaryTextColor} !important`};
        ${secondaryBgColor && `--ant-button-default-active-bg: ${secondaryBgColor}90 !important`};
        ${secondaryTextColor && `--ant-button-default-active-color: ${secondaryTextColor} !important`};
        ${secondaryBgColor && `--ant-button-default-active-border-color: ${secondaryBgColor} !important`};
        ${secondaryBgColor && `--ant-button-default-hover-bg: ${secondaryBgColor}90 !important`};
        ${secondaryBgColor && `--ant-button-default-hover-border-color: ${secondaryBgColor}90 !important`};
        ${secondaryTextColor && `--ant-button-default-hover-color: ${secondaryTextColor}90 !important`};
        ${secondaryTextColor && `--ant-button-default-color: ${secondaryTextColor} !important`};
        font-family: ${styles.fontFamily};
    }

    .ant-btn-primary {
        ${primaryBgColor && `--ant-color-primary: ${primaryBgColor};`}
        ${primaryBgColor && `--ant-button-primary-active-bg: ${primaryBgColor} !important`};
        ${primaryBgColor && `--ant-color-primary-active: ${primaryBgColor}90 !important`};
        ${primaryBgColor && `--ant-color-primary-hover: ${primaryBgColor}90 !important`};
        ${primaryTextColor && `--ant-button-primary-hover-color: ${primaryTextColor} !important`};
        ${primaryTextColor && `--ant-color-text-light-solid: ${primaryTextColor} !important`};
        ${secondaryBgColor && `--ant-button-primary-hover-border-color: ${secondaryBgColor} !important`};
        ${primaryTextColor && `--ant-button-primary-color: ${primaryTextColor} !important`};
        font-family: ${styles.fontFamily};
      }
  }
    
    ${rest}
      
    .${shaWizardContainer} {
      margin: unset;
          
      .${shaStepsContent} {
        flex: 1 1 auto;
        white-space: nowrap;
        margin: 20px 0;
      }
  
      &.vertical {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
  
        .${prefixCls}-steps-vertical {
          width: 150px;
        }
  
        .${shaStepsContent} {
          flex: 1;
          margin: unset;
        }
      }
    }
      
    .${shaStepsButtonsContainer} {
      display: flex;
  
      &.split {
        justify-content: space-between;
      }
  
      &.left {
        justify-content: flex-start;
      }
  
      &.right {
        justify-content: flex-end;
      }
    }
  `);
  return {
    shaWizard,
    shaWizardContainer,
    shaStepsContent,
    shaStepsButtonsContainer,
    shaStepsButtons,
  };
});