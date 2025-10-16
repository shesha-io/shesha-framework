import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, {
  fontWeight,
  fontFamily,
  textAlign,
  color,
  fontSize,
  striped,
  hoverHighlight,
  stickyHeader,
  rowBackgroundColor,
  rowAlternateBackgroundColor,
  rowHoverBackgroundColor,
  rowSelectedBackgroundColor,
  borderRadius,
}) => {
  const dataTable = cx("sha-data-table", css`
    ${`
      .ant-table {
        border-radius: ${borderRadius};
        font-family: ${fontFamily};
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        color: ${color};
        text-align: ${textAlign};
      }

      .ant-table-thead > tr > th {
        ${stickyHeader ? 'position: sticky; top: 0; z-index: 1;' : ''}
      }

      /* React Table specific row styling */
      .sha-react-table .sha-table .tr.tr-body {
        ${rowBackgroundColor ? `background-color: ${rowBackgroundColor} !important;` : ''}
      }

      ${striped && rowAlternateBackgroundColor ? `
        .sha-react-table .sha-table .tr.tr-body.tr-odd {
          background-color: ${rowAlternateBackgroundColor} !important;
        }
      ` : striped ? `
        .sha-react-table .sha-table .tr.tr-body.tr-odd {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
      ` : ''}

      ${hoverHighlight && rowHoverBackgroundColor ? `
        .sha-react-table .sha-table .tbody .tr.tr-body:hover {
          background-color: ${rowHoverBackgroundColor} !important;
        }
      ` : hoverHighlight ? `
        .sha-react-table .sha-table .tbody .tr.tr-body:hover {
          background-color: ${token.colorPrimaryBg} !important;
        }
      ` : ''}

      ${rowSelectedBackgroundColor ? `
        .sha-react-table .sha-table .tr.tr-body.sha-tr-selected {
          background-color: ${rowSelectedBackgroundColor} !important;
        }
      ` : ''}

      .ant-table-thead > tr > th {
        border-bottom: 1px solid ${token.colorBorder};
      }

      .ant-table-tbody > tr > td {
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
    `}
  `);

  return {
    dataTable,
  };
});
