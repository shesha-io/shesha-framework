import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaMultiEntityCell = cx("sha-form-cell", css`
      white-space: normal;
    `);

  // Common base styles for form and data cells
  const shaCellBase = css`
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;

      /* Ensure all form inputs are constrained */
      .ant-input,
      .ant-select,
      .ant-picker,
      .ant-input-number,
      .ant-checkbox-wrapper,
      .ant-radio-wrapper,
      .ant-switch,
      .ant-slider,
      .ant-rate,
      .ant-cascader,
      .ant-tree-select,
      .ant-mentions,
      .ant-transfer,
      .ant-upload,
      .ant-time-picker,
      .ant-date-picker,
      .ant-week-picker,
      .ant-month-picker,
      .ant-quarter-picker,
      .ant-year-picker,
      .ant-range-picker {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box;
      }

      /* Handle select dropdowns */
      .ant-select-selector {
        width: 100% !important;
        max-width: 100% !important;
      }

      /* Handle form items */
      .ant-form-item {
        width: 100%;
        max-width: 100%;
        margin-bottom: 8px;
      }

      /* Handle any custom components */
      > div,
      > span,
      > input,
      > select,
      > textarea {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box;
      }

      /* Ensure proper text wrapping */
      * {
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
    `;

  const shaFormCell = cx("sha-form-cell", shaCellBase, css`
      .ant-form-item-control {
        flex-direction: column;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 100%;
      }

      .ant-form-item-control-input {
        width: 100%;
        min-height: --ant-control-height;
        max-width: 100%;
      }

      .ant-form-item-control-input-content {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }
    `);

  const shaDataCell = cx("sha-data-cell", shaCellBase, css`
      /* Ensure the flex container doesn't overflow */
      > div {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }
    `);

  const tableErrorContainer = cx("sha-table-error-container", css`
        margin-top: 0;
    
        &:empty {
        margin: unset;
        }    
    `);

  const shaSpanCenterVertically = css`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    `;

  return {
    shaChildTableErrorContainer: tableErrorContainer,
    shaFormCell,
    shaDataCell,
    shaMultiEntityCell,
    shaSpanCenterVertically,
  };
});
