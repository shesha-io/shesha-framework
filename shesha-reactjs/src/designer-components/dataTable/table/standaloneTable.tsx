import React, { FC } from 'react';
import { ITableComponentProps } from './models';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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

export const StandaloneTable: FC<ITableComponentProps> = (_props) => {
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    fontSize: '14px',
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#fafafa',
    border: '1px solid #e8e8e8',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: '14px',
    color: '#262626',
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: '1px solid #e8e8e8',
    color: '#595959',
    fontSize: '14px',
  };

  const actionCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: 'center',
    width: '20px',
  };

  const iconStyle: React.CSSProperties = {
    margin: '0 4px',
    color: '#1890ff',
  };

  return (
    <div
      className="sha-standalone-table-wrapper"
      style={{
        padding: '16px',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        position: 'relative',
      }}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, width: '20px' }}></th>
            <th style={{ ...headerStyle, width: '20px' }}></th>
            <th style={{ ...headerStyle, width: '20px' }}></th>
            {columns.map((column, index) => (
              <th key={index} style={headerStyle}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dummyRows.map((_, rowIndex) => (
            <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={actionCellStyle}>
                <SearchOutlined style={iconStyle} />
              </td>
              <td style={actionCellStyle}>
                <EditOutlined style={iconStyle} />
              </td>
              <td style={actionCellStyle}>
                <DeleteOutlined style={iconStyle} />
              </td>
              {columns.map((_column, colIndex) => (
                <td key={colIndex} style={cellStyle}>
                  {colIndex === 0 ? `Record ${rowIndex + 1}` : 'Placeholder Info'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
