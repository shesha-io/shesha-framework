import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
    const pickerEllipsisBtnWidth = "45px";

    const pickerInputGroup = "picker-input-group";
    const pickerInputGroupInput = "picker-input-group-input";
    const pickerInputGroupEllipsis = "picker-input-group-ellipsis";
    const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

    const shaReactTable = "sha-react-table";
    const shaGlobalTableFilter = "sha-global-table-filter";
    

    const entityPickerContainer = cx("entity-picker-container", css`
    .${pickerInputGroup} {
      .${pickerInputGroupInput} {
        width: calc(100% - ${pickerEllipsisBtnWidth});
      }
  
      .${pickerInputGroupEllipsis} {
        width: ${pickerEllipsisBtnWidth};
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

    return {
        entityPickerContainer,
        pickerInputGroup,
        pickerInputGroupInput,
        pickerInputGroupEllipsis,
        entityPickerModalPagerContainer,
        entityPickerModal,
    };
});