import { FC } from 'react';
import * as React from 'react';
import { ITableComponentProps } from './models';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createStyles } from '@/styles';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { isDefined } from '@/utils/nullables';
import { addPx } from '@/utils/style';
import { TableAppearance, useTableAppearance } from './useTableAppearance';

// Ignore any configured items to ensure clean state when dragged outside
const columns = [
  { header: 'Heading 1', accessor: 'col1' },
  { header: 'Heading 2', accessor: 'col2' },
];

// Create dummy data rows that match the mockup exactly
const dummyRows = [
  { col1: 'Record 1', col2: 'Placeholder Info' },
  { col1: 'Record 2', col2: 'Placeholder Info' },
];

/** CSS declarations for a React style object, e.g. `{ borderTopWidth: '1px' }` → `border-top-width: 1px;`. */
const toCss = (style: React.CSSProperties): string => Object.entries(style)
  .filter(([, value]) => value !== undefined && value !== null && value !== '')
  .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${String(value)};`)
  .join(' ');

const decl = (property: string, value: string | number | undefined | null): string =>
  value === undefined || value === null || value === '' ? '' : `${property}: ${value};`;

/** A configured color, with an empty string treated as not set (as the live table does). */
const color = (value: string | undefined): string | undefined => value === '' ? undefined : value;

type StylesArgs = { appearance: TableAppearance; model: ITableComponentProps };

/**
 * The placeholder table drawn with the same table appearance as the real one (the theme and the
 * component's own settings): header, rows, cells, borders, fonts and action icons.
 */
const useStyles = createStyles(({ css, cx, token }, { appearance, model }: StylesArgs) => {
  const {
    backgroundColor, headerFontFamily, headerFontSize, headerFontWeight, headerTextColor, headerTextAlign,
    bodyTextAlign, bodyFontFamily, bodyFontSize, bodyFontWeight, bodyFontColor, rowHeight, rowPadding, rowBorder, boxShadow,
  } = appearance;
  const {
    border, headerBorder, cellBorder, headerShadow, rowShadow, rowBorderStyle, headerBackgroundColor,
    rowBackgroundColor, rowAlternateBackgroundColor, striped, cellBorders, cellBorderColor, rowDividers,
    actionIconSize, actionIconColor, dimensions, hoverHighlight, rowHoverBackgroundColor,
  } = model;
  const iconSize = addPx(actionIconSize ?? bodyFontSize) ?? '16px';
  const rowBackground = color(rowBackgroundColor);
  // Alternate rows differ only when striped, as in the live table.
  const alternateBackground = striped === true ? (color(rowAlternateBackgroundColor) ?? 'rgba(0, 0, 0, 0.02)') : rowBackground;
  const hoverBackground = color(rowHoverBackgroundColor) ?? token.colorPrimary;

  const standaloneTable = cx('sha-standalone-table', css`
    width: 100%;
    overflow: auto;
    ${decl('box-shadow', boxShadow)}
    ${decl('height', addPx(dimensions?.height as string | number | undefined))}
    ${decl('min-height', addPx(dimensions?.minHeight as string | number | undefined))}
    ${decl('max-height', addPx(dimensions?.maxHeight as string | number | undefined))}
    ${toCss(getBorderStyle(border ?? {}, {}))}

    table {
      width: 100%;
      border-collapse: collapse;
      background: ${backgroundColor ?? 'white'};
    }

    th, td {
      padding: 0.5rem;
      vertical-align: middle;
    }

    thead tr {
      box-shadow: 0 2px 15px 0 rgb(0 0 0 / 15%);
      background-color: ${headerBackgroundColor ?? backgroundColor ?? token.colorBgContainer};
      color: ${headerTextColor ?? '#000000'};
      ${decl('font-family', headerFontFamily)}
      ${decl('font-size', headerFontSize)}
      font-weight: ${headerFontWeight ?? 500};
      ${toCss(getBorderStyle(headerBorder ?? {}, {}))}
      ${toCss(getShadowStyle(headerShadow))}
    }

    th {
      /* Browsers make th bold: take the header row's weight instead. */
      font-weight: inherit;
      text-align: ${headerTextAlign ?? 'left'};
    }

    tbody tr {
      ${decl('height', rowHeight)}
      background: ${rowBackground ?? 'transparent'};
      ${isDefined(rowBorderStyle) ? toCss(getBorderStyle(rowBorderStyle, {})) : decl('border', rowBorder)}
      ${rowDividers === true ? `border-bottom: 1px solid ${token.colorBorderSecondary};` : ''}
      ${toCss(getShadowStyle(rowShadow))}

      &:nth-child(even) {
        background: ${alternateBackground ?? 'transparent'};
      }

      ${hoverHighlight === true ? `&:hover { background: ${hoverBackground}; }` : ''}
    }

    td {
      ${decl('padding', rowPadding)}
      ${decl('text-align', bodyTextAlign)}
      ${decl('font-family', bodyFontFamily)}
      ${decl('font-size', bodyFontSize)}
      ${decl('font-weight', bodyFontWeight)}
      ${decl('color', bodyFontColor)}
      ${cellBorders === true ? decl('border', isDefined(cellBorderColor) ? `1px solid ${cellBorderColor}` : undefined) : ''}
      ${toCss(getBorderStyle(cellBorder ?? {}, {}))}
    }

    th.sha-standalone-action, td.sha-standalone-action {
      width: 1%;
      padding: 0.5rem 0.25rem;
      text-align: center;
    }

    td.sha-standalone-action .anticon {
      font-size: ${iconSize};
      color: ${actionIconColor ?? token.colorPrimary};
    }
  `);

  return { standaloneTable };
});

/** The table drawn outside a Data Context, where it has no data: sample columns and rows, in the table's own appearance. */
export const StandaloneTable: FC<ITableComponentProps> = (props) => {
  const appearance = useTableAppearance(props);
  const { styles } = useStyles({ appearance, model: props });

  return (
    <div className="sha-standalone-table-wrapper sha-datatable-wrapper">
      <div className={appearance.wrapperClassName} style={appearance.wrapperStyle}>
        <div className={styles.standaloneTable}>
          <table>
            <thead>
              <tr>
                <th className="sha-standalone-action"></th>
                <th className="sha-standalone-action"></th>
                <th className="sha-standalone-action"></th>
                {columns.map((column) => (
                  <th key={column.accessor}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dummyRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="sha-standalone-action"><SearchOutlined /></td>
                  <td className="sha-standalone-action"><EditOutlined /></td>
                  <td className="sha-standalone-action"><DeleteOutlined /></td>
                  {columns.map((column) => (
                    <td key={column.accessor}>{row[column.accessor as keyof typeof row]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
