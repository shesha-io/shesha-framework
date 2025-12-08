import React, { FC } from 'react';
import { ITableComponentProps } from './models';
import { SearchOutlined, EditOutlined, DeleteOutlined, InfoCircleFilled } from '@ant-design/icons';
import { Popover } from 'antd';
import { useForm } from '@/providers';
import { useDataTableStore } from '@/providers/dataTable';
import { useStyles } from '../tableContext/styles';

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
  const { formMode } = useForm();
  const { styles } = useStyles();
  const store = useDataTableStore(false);
  const isDesignMode = formMode === 'designer';
  const hasNoColumns = !_props.items || _props.items.length === 0;
  const isInsideDataContext = !!store;

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
    <div style={{
      padding: '16px',
      borderRadius: '6px',
      backgroundColor: '#fafafa',
      position: 'relative',
    }}
    >
      {/* Show info icon in top-right corner in designer mode */}
      {isDesignMode && (
        <Popover
          placement="left"
          title="Hint:"
          classNames={{ body: styles.datatableHintPopover }}
          rootClassName={styles.datatableHintPopover}
          content={isInsideDataContext ? (
            <p>
              This Data Table has no columns configured.<br />
              Click the Settings icon in the Properties Panel<br />
              to configure columns.
              <br /><br />
              <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">
                See component documentation
              </a>
              <br />for setup and usage.
            </p>
          ) : hasNoColumns ? (
            <p>
              This Data Table is not inside a Data Context<br />
              and has no columns configured.<br />
              <br />
              Drag it into a Data Context component to<br />
              connect it to data, then configure columns<br />
              in the Properties Panel.
              <br /><br />
              <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">
                See component documentation
              </a>
              <br />for setup and usage.
            </p>
          ) : (
            <p>
              This Data Table is not inside a Data Context.<br />
              Drag it into a Data Context component to<br />
              connect it to data.
              <br /><br />
              <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">
                See component documentation
              </a>
              <br />for setup and usage.
            </p>
          )}
        >
          <InfoCircleFilled
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              color: '#faad14',
              fontSize: '20px',
              zIndex: 9999,
              cursor: 'help',
              backgroundColor: '#fff',
              borderRadius: '50%',
              padding: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        </Popover>
      )}

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
