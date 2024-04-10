import { colors, sizesPx } from "@/styles/variables";
import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
  const shaMainLayout = cx(
    `${prefixCls}-layout`,
    css`
      * {
        font-family: "Roboto", sans-serif;
      }

      min-height: 100vh;
      overflow: auto;

      .${prefixCls}-layout-header {
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

      .${prefixCls}-layout-content {
        padding: 50px 15%;
      }

      .sha-components-container {
        &.sha-index-table-control,
        &.sha-index-toolbar {
          border: 1px solid ${colors.greyLine};
          margin-bottom: 12px;

          .${prefixCls}-btn {
            min-width: unset !important;
          }

          .${prefixCls}-select {
            border-width: 1px;
            height: unset !important;
          }

          .${prefixCls}-select-selector,
          .${prefixCls}-input-affix-wrapper {
            border-width: 1px !important;
            height: unset !important;
          }
        }

        .sha-react-table {
          font-size: 16px;
          margin: 0;

          .tr-head {
            font-weight: bold;
            font-size: 14px;
          }
        }

        .${prefixCls}-pagination {
          font-size: 16px;

          .${prefixCls}-pagination-options {
            .${prefixCls}-select-selector {
              font-size: 16px;
            }
          }
        }

        .${prefixCls}-btn {
          border-radius: 5px;
          font-size: 14px;
          min-height: 30px;
          min-width: 100px;

          &.${prefixCls}-btn-primary,
          &.${prefixCls}-btn-ghost,
          &.${prefixCls}-btn-link {
            border: none;
          }

          &.${prefixCls}-btn-sm {
            font-size: 12px;
            min-height: 21px;
            min-width: 70px;
          }

          &.${prefixCls}-btn-lg {
            font-size: 18px;
            min-height: 45px;
            min-width: 150px;
          }

          &.${prefixCls}-btn-link {
            box-shadow: none;
          }
        }

        .${prefixCls}-input-affix-wrapper,
        .${prefixCls}-select > .${prefixCls}-select-selector,
        .${prefixCls}-picker,
        .${prefixCls}-input-number,
        .${prefixCls}-form-item-control-input-content > .${prefixCls}-input {
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

        .${prefixCls}-select {
          height: ${sizesPx.inputHeight};
        }

        .${prefixCls}-input-number-input-wrap {
          height: 100%;

          .${prefixCls}-input-number-input {
            height: 100%;
            padding: 0;
          }
        }

        .${prefixCls}-input-textarea-affix-wrapper,
        .${prefixCls}-form-item-control-input-content > textarea {
          min-height: 180px !important;
        }

        .${prefixCls}-input-textarea-affix-wrapper {
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

        .${prefixCls}-input-data-count {
          bottom: calc(
            ${token.fontSize} * ${token.lineHeight} * -1) - 12px
          );
        }

        .${prefixCls}-input-show-count {
          margin-bottom: 26px !important;
        }

        .${prefixCls}-alert {
          border: none;
          border-radius: 8px;
          padding: 18px 36px;

          &.${prefixCls}-alert-error {
            background-color: ${colors.error};
          }

          &.${prefixCls}-alert-info {
            background-color: ${colors.info};
          }

          &.${prefixCls}-alert-success {
            background-color: ${colors.success};
          }

          &.${prefixCls}-alert-warning {
            background-color: ${colors.warning};
          }

          .${prefixCls}-alert-content {
            .${prefixCls}-alert-description {
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

        .${prefixCls}-checkbox .${prefixCls}-checkbox-inner,
        .${prefixCls}-radio .${prefixCls}-radio-inner {
          font-family: arial;
          height: 20px;
          width: 20px;
        }

        .${prefixCls}-steps {
          .${prefixCls}-steps-item {
            &.${prefixCls}-steps-item-finish {
              .${prefixCls}-steps-item-icon {
                border: 1px solid ${token.colorPrimary};
                background: none;
              }
            }

            &.${prefixCls}-steps-item-wait {
              .${prefixCls}-steps-item-icon {
                border: 1px solid ${token.colorTextDescription};
                background: none;
              }
            }

            .${prefixCls}-steps-item-title {
              font-family: arial;
              font-weight: bold;
            }

            .${prefixCls}-steps-item-description {
              font-size: 12px;
              line-height: 10px;
            }
          }
        }

        .${prefixCls}-tag {
          padding: 6px 10px;
          border-radius: 14px;
        }

        .${prefixCls}-rate {
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
