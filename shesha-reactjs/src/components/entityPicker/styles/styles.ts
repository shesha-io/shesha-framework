import { createStyles, sheshaStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, prefixCls, token }, { style }: { style?: CSSProperties }) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "picker-input-group-ellipsis";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";

  const entityPickerContainer = cx("entity-picker-container", css`
    width: ${style?.width || '100%'};
    .${pickerInputGroup} {
      .${pickerInputGroupInput} {
        width: calc(100% + ${pickerEllipsisBtnWidth});
      }
        
      .${pickerInputGroupEllipsis} {
        width: ${pickerEllipsisBtnWidth};
      }
    }  
      .${pickerInputGroupEllipsis} {
        &:hover {
          border-color: ${token.colorPrimary} !important;
        }
      }
  
    .global-tablefilter {
      padding-right: unset !important;
    }
  `);

  const entityPickerModal = cx("entity-picker-modal", css`
        .${prefixCls}-modal-body {
          .ant-alert {
            margin-bottom: 8px;
          }
        }
        .${shaGlobalTableFilter} {
          margin: unset !important;
          width: 100%;
          padding: unset;
        }
      
        .${shaReactTable} {
          margin: unset;
        }
      
        .${entityPickerModalPagerContainer} {
          display: flex;
          justify-content: flex-end;
          margin: ${sheshaStyles.paddingLG}px 0;
      
          .${prefixCls}-pagination-options-size-changer {
            margin-right: 0 !important;
          }
        }
      
        .${prefixCls}-modal-footer {
          padding: 12px 24px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          column-gap: 12px;
        }
    `);

  const entitySelect = cx("entity-select", css`
        --ant-color-text: ${style?.color || '#000'} !important;
        width: calc(100% - 32px) !important;
        &:hover {
                border-color: ${token.colorPrimary} !important;
              }

        .ant-select-selector {
          overflow: auto !important;
          scrollbar-width: thin !important;
          -ms-overflow-style: none !important;
          &::-webkit-scrollbar {
            width: 8px !important;
          }
        }

        .ant-select-selection-overflow-item-suffix {
          display: none !important;
        };

        .ant-select-selector > ant-select-selection-search, ant-select-selection-placeholder {
          border-right: 1px solid #d9d9d9;
          padding: 0 8px !important;
          * {
            font-size: ${style?.fontSize || '14px'} !important;
            font-weight: ${style?.fontWeight} !important;
            color: ${style?.color || '#000'} !important;
            font-family: ${style?.fontFamily || 'inherit'} !important;  
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            }
          }

          .ant-select-selection-item {
            font-size: ${style?.fontSize || '14px'} !important;
            font-weight: ${style?.fontWeight} !important;
            color: ${style?.color || '#000'} !important;
            font-family: ${style?.fontFamily || 'inherit'} !important;  
            
          }

      `);

  return {
    entityPickerContainer,
    pickerInputGroup,
    pickerInputGroupInput,
    pickerInputGroupEllipsis,
    entityPickerModalPagerContainer,
    entityPickerModal,
    entitySelect
  };
});