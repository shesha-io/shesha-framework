import React, { CSSProperties, FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useDataTable } from '@/providers';
import { useNearestDataContext } from '@/providers/dataContextManager';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { useTheme } from '@/providers/theme';

export interface ITablePagerProps {
  showSizeChanger?: boolean;
  showTotalItems?: boolean;
  font?: IFontValue;
  shadow?: IShadowValue;
  background?: IBackgroundValue;
  border?: IBorderValue;
  style?: CSSProperties;
}

export const TablePager: FC<ITablePagerProps> = ({ showSizeChanger, showTotalItems, style }) => {
  const dataTableContext = useDataTable(false);
  const nearestDataTableContext = useNearestDataContext('control');
  const { theme } = useTheme();

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  // Check if there's a sibling data context with a data table or data list
  const hasDataSibling = nearestDataTableContext &&
    (nearestDataTableContext.type === 'control' || nearestDataTableContext.name?.toLowerCase().includes('data'));

  // Fallback UI when not in a Data Context and no data siblings
  if (!dataTableContext && !hasDataSibling) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#fafafa',
          color: '#8c8c8c',
          fontSize: '14px',
          gap: 8,
        }}>
          <span>Table Pager</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>•••</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>Page 1 of 1</span>
        </div>
        <Popover
          placement="right"
          title="Hint:"
          overlayInnerStyle={{
            backgroundColor: '#D9DCDC',
          }}
          content={(<p>The Table Pager component must be<br />placed inside of a Data Context component<br />that contains a configured Data Table or<br />Data List to be fully functional.
            <br />
            <br />
            <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
          </p>)}
        >
          <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
        </Popover>
      </div>
    );
  }

  const {
    pageSizeOptions,
    currentPage,
    totalRows,
    selectedPageSize,
    setCurrentPage,
    changePageSize,
    dataFetchingMode,
  } = dataTableContext;

  // Fallback UI when in Data Context but no configured DataTable/DataList
  // If we have a data sibling but no direct data table context, show a different message
  if ((totalRows === undefined || totalRows === null) && !hasDataSibling) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#fafafa',
          color: '#8c8c8c',
          fontSize: '14px',
          gap: 8,
        }}>
          <span>Table Pager</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>•••</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>Page 1 of 1</span>
        </div>
        <Popover
          placement="right"
          title="Hint:"
          overlayInnerStyle={{
            backgroundColor: '#D9DCDC',
          }}
          content={(<p>The Table Pager is within a Data Context<br />but no sibling Data Table or Data List<br />component has been configured with<br />columns or items.
            <br />
            <br />
            <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
          </p>)}
        >
          <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
        </Popover>
      </div>
    );
  }

  // If we have a data sibling but no direct table context with totals, show a simplified pager
  if (hasDataSibling && (totalRows === undefined || totalRows === null)) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#f0f9ff',
          color: '#1890ff',
          fontSize: '14px',
          gap: 8,
        }}>
          <span>Table Pager</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>•••</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>Data Context Active</span>
        </div>
      </div>
    );
  }

  return dataFetchingMode === 'paging' ? (
    <TablePaging
      {...{
        pageSizeOptions,
        currentPage,
        totalRows,
        selectedPageSize,
        showSizeChanger: !hideTotalItems && showSizeChanger,
        showTotalItems: !hideTotalItems && showTotalItems,
        setCurrentPage,
        changePageSize,
        dataFetchingMode,
        style,
      }}
    />
  ) : (
    <TableNoPaging totalRows={totalRows} style={style} />
  );
};

export default TablePager;
