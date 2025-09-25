import { createGlobalStyle } from "antd-style";
import { sheshaStyles } from '@/styles';


export const GlobalTableStyles = createGlobalStyle`
  .sha-components-container.sha-index-table-control {
    background: white;
    padding: ${sheshaStyles.paddingMD}px ${sheshaStyles.paddingLG}px !important;
    justify-content: space-between;
    align-items: center;
    padding: 0px ${sheshaStyles.paddingLG}px;
    min-height: ${sheshaStyles.pageHeadingHeight} !important;
    border-bottom: ${sheshaStyles.border};

    .sha-components-container,
    .sha-components-container-inner {
        height: 100% !important;
    }

    .${(p) => p.theme.prefixCls}-form-item {
      margin: unset !important;
    }

    .index-table-controls-left,
    .index-table-controls-right {
      .sha-components-container {
        justify-content: unset;
        align-items: center;

        .sha-components-container-inner {
          height: ${sheshaStyles.pageHeadingHeight} !important;
          display: flex;
          align-items: center;

          button {
            padding: unset;
          }
        }
      }
    }
  }
      
  @media (${sheshaStyles.mediaPhoneLg}) {
    .sha-components-container.sha-index-table-control {
      .index-table-controls-left,
      .index-table-controls-right {
        .sha-components-container {
          .sha-components-container-inner {
            height: unset !important;
          }
        }
      }
    }
  }
  .sha-react-table {
    .td {
      .${(p) => p.theme.prefixCls}-form-item {
        width: 100%;
    
        .${(p) => p.theme.prefixCls}-row {
          &.${(p) => p.theme.prefixCls}-form-item-row {
            margin: 0;
    
            .${(p) => p.theme.prefixCls}-picker, .${(p) => p.theme.prefixCls}-input-number {
              width: 100%;
            }
          }
        }
      }
      .sha-form-cell {
        .${(p) => p.theme.prefixCls}-form-item {
          .${(p) => p.theme.prefixCls}-row {
            &.${(p) => p.theme.prefixCls}-form-item-row {
              margin-bottom: 5px;
            }
          }
        }
      }
    }
  }
`;
