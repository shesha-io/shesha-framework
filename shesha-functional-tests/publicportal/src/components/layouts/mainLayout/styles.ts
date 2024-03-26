import { colors, sizesPx } from "@/styles/variables";
import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token }) => {
  const shaMainLayout = cx(
    "ant-layout",
    css`
      * {
        font-family: "Roboto", sans-serif;
      }

      min-height: 100vh;
      overflow: auto;

      .ant-layout-header {
        border: none;
        box-shadow: 1px 1px 5px 2px #d7d7d7;
        display: flex;
        justify-content: space-between;
        background: #fff;
        height: 80px;
        border-bottom: 1px solid #d9d9d9;
        line-height: 80px;
        padding: 0 10%;
      }

      .ant-layout-content {
        padding: 50px 15%;
      }

      .sha-components-container {
        .ant-btn {
          border-radius: 5px;
          font-size: 14px;
          min-height: 30px;
          min-width: 100px;

          &.ant-btn-primary,
          &.ant-btn-ghost,
          &.ant-btn-link {
            border: none;
          }

          &.ant-btn-sm {
            font-size: 12px;
            min-height: 21px;
            min-width: 70px;
          }

          &.ant-btn-lg {
            font-size: 18px;
            min-height: 45px;
            min-width: 150px;
          }

          &.ant-btn-link {
            box-shadow: none;
          }
        }

        .ant-input-affix-wrapper,
        .ant-select > .ant-select-selector,
        .ant-picker,
        .ant-input-number,
        .ant-form-item-control-input-content > .ant-input {
          border: 2px solid #d8d8d8;
          border-radius: 5px;
          font-size: 18px;
          height: ${sizesPx.inputHeight};
          padding-left: 22px;
          padding-right: 22px;

          input {
            font-size: 18px;
          }

          &:focus {
            border: 2px solid ${token.colorPrimary};
          }

          &::placeholder {
            font-weight: bold;
          }
        }

        .ant-select {
          height: ${sizesPx.inputHeight};
        }

        .ant-input-number-input-wrap {
          height: 100%;

          .ant-input-number-input {
            height: 100%;
            padding: 0;
          }
        }

        .ant-input-textarea-affix-wrapper,
        .ant-form-item-control-input-content > textarea {
          min-height: 180px !important;
        }

        .ant-input-textarea-affix-wrapper {
          padding-left: unset;
          padding-right: unset;

          textarea {
            padding-left: 22px;
            padding-right: 22px;

            &::placeholder {
              font-weight: bold;
            }
          }
        }

        .ant-input-data-count {
          bottom: calc(
            ${token.fontSize} * ${token.lineHeight} * -1) - 12px
          );
        }

        .ant-input-show-count {
          margin-bottom: 26px !important;
        }

        .ant-alert {
          border: none;
          border-radius: 8px;
          padding: 18px 36px;

          &.ant-alert-error {
            background-color: ${colors.error};
          }

          &.ant-alert-info {
            background-color: ${colors.info};
          }

          &.ant-alert-success {
            background-color: ${colors.success};
          }

          &.ant-alert-warning {
            background-color: ${colors.warning};
          }

          .ant-alert-content {
            .ant-alert-description {
              color: #fff;
            }
          }

          .anticon {
            svg {
              fill: #fff;
              font-size: 20px;
            }
          }
        }

        .ant-checkbox .ant-checkbox-inner,
        .ant-radio .ant-radio-inner {
          font-family: arial;
          height: 20px;
          width: 20px;
        }

        .ant-steps {
          .ant-steps-item {
            &.ant-steps-item-finish {
              .ant-steps-item-icon {
                border: 1px solid ${token.colorPrimary};
                background: none;
              }
            }

            &.ant-steps-item-wait {
              .ant-steps-item-icon {
                border: 1px solid ${token.colorTextDescription};
                background: none;
              }
            }

            .ant-steps-item-title {
              font-family: arial;
              font-weight: bold;
            }

            .ant-steps-item-description {
              font-size: 12px;
              line-height: 10px;
            }
          }
        }

        .ant-tag {
          padding: 6px 10px;
          border-radius: 14px;
        }

        .ant-rate {
          .anticon {
            svg {
              height: 30px;
              width: 30px;
            }
          }
        }
      }
    `
  );

  return {
    shaMainLayout,
  };
});
