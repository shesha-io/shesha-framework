import { sheshaStyles } from '@/styles';
import { createGlobalStyle } from 'antd-style';

const shaBorder = '1px solid #d3d3d3'; // @sha-border

export const GlobalSheshaStyles = createGlobalStyle`
  .sha-index-table-full {
    .sha-react-table {
      margin-top: ${sheshaStyles.paddingLG}px;
    }
    .sha-index-table {
      margin: 0 ${sheshaStyles.paddingLG}px;
    }
  }
  .sha-index-toolbar {
    border-bottom: ${shaBorder};

    background: white;
    max-height: ${sheshaStyles.pageHeadingHeight} !important;
  
    .sha-components-container-inner {
      display: flex !important;
    }
  
    ${sheshaStyles.flexCenterAlignedSpaceBetween}
    width: 100%;
    padding: 0 ${sheshaStyles.paddingLG}px;

    &.sha-paging-height {
      height: 46px;
    }
  
    .sha-index-toolbar-left {
      button {
        padding-left: unset;
      }
    }    
  }

  .${(p) => p.theme.prefixCls}-select-dropdown--multiple {
    .${(p) => p.theme.prefixCls}-select-dropdown-menu {
      .${(p) => p.theme.prefixCls}-select-dropdown-menu-item {
        &.${(p) => p.theme.prefixCls}-select-dropdown-menu-item-selected {
          display: none;
        }
      }
    }
  }
  
  .${(p) => p.theme.prefixCls}-select-dropdown {
    .${(p) => p.theme.prefixCls}-select-item {
      &.${(p) => p.theme.prefixCls}-select-item-option-selected {
        display: none;
      }
    }
  }

  .${(p) => p.theme.prefixCls}-form-item-label  {
    white-space: normal;
    font-weight: bold;
  }
  .${(p) => p.theme.prefixCls}-form-item {
    margin-bottom: 0 !important;
  
    .${(p) => p.theme.prefixCls}-row {
      &.${(p) => p.theme.prefixCls}-form-item-row {
        margin-bottom: 5px;
      }
    }
  }

  .sha-form-designer {
    .sha-index-toolbar {
      max-height: unset !important;
    } 
  }
  
  .${(p) => p.theme.prefixCls}-row {
    &.${(p) => p.theme.prefixCls}-form-item {
      margin-bottom: 5px;
    }
  }
  
  .${(p) => p.theme.prefixCls}-space {
    flex-wrap: wrap;
  }
  
  .${(p) => p.theme.prefixCls}-form {
    .${(p) => p.theme.prefixCls}-alert {
      margin-bottom: 5px;
    }
  }

  .${(p) => p.theme.prefixCls}-tree-list {
    padding: 18px 0;
  }
  
  body {
    margin: 0;
  }

  [hidden] {
    display: none !important;
  }
  .${(p) => p.theme.prefixCls}-btn:empty {
    display: inline-block;
    width: 0;
    visibility: hidden;
    content: '\a0';
  }
  .sha-required-mark {
    margin-left: 4px;
    color: ${(p) => p.theme.colorErrorText};
    font-family: ${(p) => p.theme.fontFamily};
    line-height: 1;
  }
`;
