import { createGlobalStyle } from "antd-style";
import { colors, fontSize } from "./variables";

export const GlobalPublicPortalStyles = createGlobalStyle`
  .sha-components-container {
    &.sha-index-table-control,
    &.sha-index-toolbar {
      border: 1px solid ${colors.greyLine};
      margin-bottom: 12px;

      .${(p) => p.theme.prefixCls}-btn {
        min-width: unset !important;
      }

      .${(p) => p.theme.prefixCls}-select {
        border-width: 1px;
      }

      .${(p) => p.theme.prefixCls}-select-selector,
      .${(p) => p.theme.prefixCls}-input-affix-wrapper {
        border-width: 1px !important;
      }
    }


    .sha-global-table-filter {
      .${(p) => p.theme.prefixCls}-input-search-button {
        height: 32px;
      }
    }
    
    .sha-react-table {
      font-size: ${fontSize.secondary};
      margin: 0;

      .tr-head {
        font-weight: bold;
        font-size: 14px;
      }

      .tbody {
        .${(p) => p.theme.prefixCls}-input,
        .${(p) => p.theme.prefixCls}-picker {
          padding-top: 0;
          padding-bottom: 0;
        }

        .${(p) => p.theme.prefixCls}-input-number-input {
          padding-top: 0;
          padding-bottom: 0;
        }

        .${(p) => p.theme.prefixCls}-tag {
          margin: 0;
          padding: 0 8px;
          border-radius: 10px;
        }

        .${(p) => p.theme.prefixCls}-btn-link {
          font-size: ${fontSize.secondary};
        }

        .${(p) => p.theme.prefixCls}-btn {
          margin-left: unset !important;
          min-width: unset !important;
        }

        .sha-upload-list-item-info, 
        .${(p) => p.theme.prefixCls}-upload-list-item {
          font-size: ${fontSize.secondary};
        }
      }
    }

    .${(p) => p.theme.prefixCls}-pagination {
      font-size: ${fontSize.secondary};
      position: relative;
      z-index: 1;

      .${(p) => p.theme.prefixCls}-pagination-options {
        .${(p) => p.theme.prefixCls}-select-selector {
          font-size: ${fontSize.secondary};
        }
      }
    }

    .${(p) => p.theme.prefixCls}-btn {
      border-radius: 5px;
      box-shadow: 1px 1px 1px 1px ${colors.grey};
      font-size: 14px;
      min-height: 30px;
      min-width: 100px;

      &.${(p) => p.theme.prefixCls}-btn-default:not(.${(p) =>
  p.theme.prefixCls}-btn-dangerous) {
        border: 1px solid ${(p) => p.theme.colorPrimary};
        color: ${(p) => p.theme.colorPrimary};
      }

      &.${(p) => p.theme.prefixCls}-btn-text:not(.${(p) =>
  p.theme.prefixCls}-btn-dangerous) {
        background: #fff;
        color: ${(p) => p.theme.colorPrimary};
      }

      &.${(p) => p.theme.prefixCls}-btn-ghost {
        color: ${colors.grey};
      }

      &.${(p) => p.theme.prefixCls}-btn-primary,
      &.${(p) => p.theme.prefixCls}-btn-ghost,
      &.${(p) => p.theme.prefixCls}-btn-link {
        border: none;
      }

      &.${(p) => p.theme.prefixCls}-btn-sm {
        font-size: 12px;
        min-height: 21px;
        min-width: 70px;
      }

      &.${(p) => p.theme.prefixCls}-btn-lg {
        font-size: ${fontSize.main};
        min-height: 45px;
        min-width: 150px;
      }

      &.${(p) => p.theme.prefixCls}-btn-link {
        box-shadow: none;
      }
    }

    .${(p) => p.theme.prefixCls}-btn-icon-only {
      min-width: 40px !important;
      min-height: unset !important;
    }

    .${(p) => p.theme.prefixCls}-input-search-button {
      height: 32px;
    }
    
    .${(p) => p.theme.prefixCls}-input-affix-wrapper,
    .${(p) => p.theme.prefixCls}-select > .${(p) =>
  p.theme.prefixCls}-select-selector,
    .${(p) => p.theme.prefixCls}-picker,
    .${(p) => p.theme.prefixCls}-form-item-control-input-content > .${(p) =>
  p.theme.prefixCls}-input {
      border: 2px solid #d8d8d8;
      border-radius: 5px;
      font-size: ${fontSize.main};
      padding-left: 22px;
      padding-right: 22px;

      input {
        font-size: ${fontSize.main};
      }

      &:focus {
        border: 2px solid ${(p) => p.theme.colorPrimary};
      }

      &::placeholder {
        font-weight: bold;
      }
    }

    .${(p) => p.theme.prefixCls}-input-number {
      border: 2px solid #d8d8d8;
      border-radius: 5px;
      font-size: ${fontSize.main};
      
      .${(p) => p.theme.prefixCls}-input-number-input {
        padding-left: 22px;
        padding-right: 22px;
      }
    }

    .${(p) => p.theme.prefixCls}-input-textarea-affix-wrapper {
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

    .${(p) => p.theme.prefixCls}-input-data-count {
      bottom: calc(
        ${(p) => p.theme.fontSize} * ${(p) => p.theme.lineHeight} * -1) - 12px
      );
    }

    .${(p) => p.theme.prefixCls}-input-show-count {
      margin-bottom: 26px !important;
    }

    .${(p) => p.theme.prefixCls}-alert {
      border: none;
      border-radius: 8px;
      padding: ${fontSize.main} 36px;

      &.${(p) => p.theme.prefixCls}-alert-error {
        background-color: ${(p) => p.theme.colorError};
      }

      &.${(p) => p.theme.prefixCls}-alert-info {
        background-color: ${(p) => p.theme.colorInfo};
      }

      &.${(p) => p.theme.prefixCls}-alert-success {
        background-color: ${(p) => p.theme.colorSuccess};
      }

      &.${(p) => p.theme.prefixCls}-alert-warning {
        background-color: ${(p) => p.theme.colorWarning};
      }

      .${(p) => p.theme.prefixCls}-alert-content {
        .${(p) => p.theme.prefixCls}-alert-description,
        .${(p) => p.theme.prefixCls}-alert-message {
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

    .${(p) => p.theme.prefixCls}-checkbox .${(p) =>
  p.theme.prefixCls}-checkbox-inner,
    .${(p) => p.theme.prefixCls}-radio .${(p) =>
  p.theme.prefixCls}-radio-inner {
      font-family: arial;
      height: 20px;
      width: 20px;
    }

    .${(p) => p.theme.prefixCls}-steps {
      .${(p) => p.theme.prefixCls}-steps-item {
        .${(p) => p.theme.prefixCls}-steps-item-title {
          font-family: arial;
          font-weight: bold;
        }

        .${(p) => p.theme.prefixCls}-steps-item-description {
          font-size: 12px;
          line-height: 10px;
        }
      }
    }

    .${(p) => p.theme.prefixCls}-tag {
      padding: 6px 10px;
      border-radius: 14px;
    }

    .${(p) => p.theme.prefixCls}-rate {
      .anticon {
        svg {
          height: 30px;
          width: 30px;
        }
      }
    }

    .${(p) => p.theme.prefixCls}-card {
      .${(p) => p.theme.prefixCls}-card-head {
        background: ${(p) => p.theme.colorPrimary};
        padding: 30px 0;
        border-bottom: none;

        .${(p) => p.theme.prefixCls}-card-head-wrapper {
          .${(p) => p.theme.prefixCls}-card-head-title {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
          }

          .${(p) => p.theme.prefixCls}-card-extra {
            position: absolute;
            right: 40px;
            top: 40px;
          }
        }
      }

      .${(p) => p.theme.prefixCls}-card-body {
        border: 2px solid ${(p) => p.theme.colorPrimary};
      }
    }

    .${(p) => p.theme.prefixCls}-collapse {
      margin-bottom: 12px;

      .${(p) => p.theme.prefixCls}-collapse-header-text {
        font-weight: bold;
      }
    }
  }

  .${(p) => p.theme.prefixCls}-modal {
    .${(p) => p.theme.prefixCls}-modal-content {
      .${(p) => p.theme.prefixCls}-modal-header {
        .${(p) => p.theme.prefixCls}-modal-title {
          border-bottom: 1px solid #d9d9d9;
          font-family: arial;
          font-size: 18px;
          padding-bottom: 12px;
        }
      }

      .${(p) => p.theme.prefixCls}-modal-footer {
        .${(p) => p.theme.prefixCls}-btn {
          border-radius: 5px;
          box-shadow: 1px 1px 1px 1px ${colors.grey};
          font-size: 14px;
          min-height: 30px;
          min-width: 100px;
    
          &.${(p) => p.theme.prefixCls}-btn-default:not(.${(p) =>
  p.theme.prefixCls}-btn-dangerous) {
            border: 1px solid ${(p) => p.theme.colorPrimary};
            color: ${(p) => p.theme.colorPrimary};
          }
    
          &.${(p) => p.theme.prefixCls}-btn-text:not(.${(p) =>
  p.theme.prefixCls}-btn-dangerous) {
            background: #fff;
            color: ${(p) => p.theme.colorPrimary};
          }
    
          &.${(p) => p.theme.prefixCls}-btn-ghost {
            color: ${colors.grey};
          }
    
          &.${(p) => p.theme.prefixCls}-btn-primary,
          &.${(p) => p.theme.prefixCls}-btn-ghost,
          &.${(p) => p.theme.prefixCls}-btn-link {
            border: none;
          }
    
          &.${(p) => p.theme.prefixCls}-btn-sm {
            font-size: 12px;
            min-height: 21px;
            min-width: 70px;
          }
    
          &.${(p) => p.theme.prefixCls}-btn-lg {
            font-size: ${fontSize.main};
            min-height: 45px;
            min-width: 150px;
          }
    
          &.${(p) => p.theme.prefixCls}-btn-link {
            box-shadow: none;
          }
        }
      }
    }
  }
`;
