import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

interface IWizardStylesProps {
  styles: CSSProperties;
  colors: {
    primaryTextColor: string;
    secondaryTextColor: string;
    primaryBgColor: string;
    secondaryBgColor: string;
  };
  activeStepStyle: CSSProperties;
  stepWidth: string;
  overflow: CSSProperties;
}

export const useStyles = createStyles(({ css, cx, prefixCls }, { styles, colors, activeStepStyle, stepWidth, overflow }: IWizardStylesProps) => {
  const shaWizardContainer = "sha-wizard-container";
  const shaStepsContent = "sha-steps-content";
  const shaStepsButtonsContainer = "sha-steps-buttons-container";
  const shaStepsButtons = "sha-steps-buttons";

  const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = colors;
  const { color, ...rest } = styles;
  const { ...overflowStyle } = overflow;
  const shaWizard = cx("sha-wizard", css`

    ${rest}
    .ant-steps-item-container {
      --ant-color-primary: ${primaryBgColor};
      --ant-color-text-description: ${activeStepStyle.color ?? color}75;
      --ant-color-text: ${activeStepStyle.color ?? color};
      --ant-font-size: calc(${activeStepStyle.fontSize ?? styles.fontSize}/1.3);
      --ant-font-size-lg: ${activeStepStyle.fontSize ?? styles.fontSize ?? 16};
      --ant-steps-nav-arrow-color: ${color}45;
      --ant-steps-finish-icon-bg-color: ${primaryBgColor}45;
      --ant-color-text-light-solid: ${primaryTextColor} !important;

      padding: 0 8px 0 0;

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

      
    .${shaWizardContainer} {
      margin: unset;
      height: calc(100% - 52px);
      display: flex;
      flex-direction: column;
      .${shaStepsContent} {
        flex: 1 1 auto;
        margin: 20px 0;
        ${overflowStyle}
      }
  
      &.vertical {
        flex-direction: row;
        margin-bottom: 20px;
        > .${prefixCls}-steps-content {
          overflow: auto;

          > .${prefixCls}-components-container {
            overflow: auto;
            min-height: 100% !important;

            > .${prefixCls}-components-container {
              overflow: auto;
              min-height: 100% !important;
            }
          }
        }
        .${prefixCls}-steps-vertical {
          width: ${stepWidth ?? '200px'};
          padding: 8px;

          >.ant-steps-item::after {
            top: -24px;
          }
        }
  
        .${shaStepsContent} {
          flex: 1;
          margin: unset;
          width: calc(100% - ${stepWidth ?? '200px'});
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