import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

type StylesArgs = Pick<CSSProperties, "fontWeight" | "fontFamily" | "textAlign" | "color" | "fontSize"> & {
  striped: boolean;
  hoverHighlight: boolean;
  rowBackgroundColor: string | undefined;
  rowAlternateBackgroundColor: string | undefined;
  rowHoverBackgroundColor: string | undefined;
  rowSelectedBackgroundColor: string | undefined;
  borderRadius?: string | undefined;
};
type StylesResponse = {
  dataTable: string;
};
export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx, token }, {
  fontWeight,
  fontFamily,
  textAlign,
  color,
  fontSize,
  striped,
  hoverHighlight,
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
          background-color: ${token.colorPrimary} !important;
        }
      ` : ''}

      ${rowSelectedBackgroundColor ? `
        .sha-react-table .sha-table .tr.tr-body.sha-tr-selected {
          background-color: ${rowSelectedBackgroundColor} !important;
        }
        /* Ensure selected row styling always takes priority over striped rows */
        .sha-react-table .sha-table .tr.tr-body.tr-odd.sha-tr-selected {
          background-color: ${rowSelectedBackgroundColor} !important;
        }
      ` : `
        /* Ensure selected row styling always takes priority over striped rows */
        .sha-react-table .sha-table .tr.tr-body.tr-odd.sha-tr-selected {
          background-color: ${token.colorPrimary} !important;
          color: white !important;
        }
      `}

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
