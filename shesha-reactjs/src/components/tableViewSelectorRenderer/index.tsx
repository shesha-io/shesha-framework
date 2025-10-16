import React, { FC, useCallback, useMemo } from 'react';
import { BulbTwoTone, DownOutlined, QuestionCircleOutlined, LayoutOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Popover, Space, Tooltip, Badge } from 'antd';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import Show from '@/components/show';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';

type MenuItem = MenuProps['items'][number];

interface ITooltipIconProps {
  tooltip: string;
}

const TooltipIcon: FC<ITooltipIconProps> = ({ tooltip }) => {
  return (
    <Tooltip title={tooltip} className="sha-tooltip-icon">
      <QuestionCircleOutlined />
    </Tooltip>
  );
};

export interface ITableViewSelectorRendererProps {
  filters?: IStoredFilter[];
  hidden?: boolean;
  selectedFilterId?: string;
  onSelectFilter: (id?: string) => void;
  showIcon?: boolean;
}

export const TableViewSelectorRenderer: FC<ITableViewSelectorRendererProps> = ({
  filters,
  hidden,
  selectedFilterId,
  onSelectFilter,
  showIcon = true,
}) => {
  const { styles } = useStyles();
  const { formMode } = useShaFormInstance();
  const getSelectedFilter = (): IStoredFilter | null => {
    if (filters?.length === 0) {
      return null;
    }

    if (selectedFilterId) {
      const foundFilter = filters?.find(({ id }) => id === selectedFilterId);

      if (foundFilter) {
        return foundFilter;
      }

      // The selected filterId is not one of these filters
      return filters[0];
    }

    return null;
  };

  const selectedFilter = getSelectedFilter();

  const { unevaluatedExpressions } = selectedFilter || {};

  const getPopoverHintContent = (): JSX.Element => {
    if (unevaluatedExpressions) {
      return (
        <div style={{ width: 450 }}>
          <div>
            This filter has dynamic expressions which have not been evaluated. Below are the filters which have not been
            evaluated
          </div>

          <ul>
            {unevaluatedExpressions?.map((item) => (
              <li key={nanoid()}>{item}</li>
            ))}
          </ul>

          <div>Please make sure you enter the relevant data</div>
        </div>
      );
    }

    return null;
  };

  const onMenuClickMemoized = useCallback(
    (info: { key: string }) => {
      onSelectFilter(info?.key);
    },
    [filters, onSelectFilter],
  );

  const menuItems = useMemo<MenuItem[]>(() => {
    return filters?.map((filter) => {
      return {
        key: filter?.id,
        label: (
          <Space>
            {filter?.name}
            <Show when={Boolean(filter?.tooltip)}>
              <TooltipIcon tooltip={filter?.tooltip}></TooltipIcon>
            </Show>
          </Space>
        ),
      };
    });
  }, [filters]);

  const renderTitle = (): JSX.Element => {
    const hasFilters = (filters?.length || 0) > 1;
    const isActiveFilter = selectedFilter?.expression !== null && selectedFilter?.expression !== undefined;

    return (
      <div className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          {showIcon && <LayoutOutlined className={styles.filterIcon} />}
          <div className={styles.titleContent}>
            <span className={styles.titleLabel}>View:</span>
            <span className={styles.titleName}>
              {selectedFilter?.name || 'Default'}
            </span>
          </div>
          {hasFilters && <DownOutlined className={styles.dropdownIcon} />}
        </div>
        {isActiveFilter && formMode === 'designer' && <Badge dot className={styles.activeBadge} />}
      </div>
    );
  };

  const hasMultipleFilters = (filters?.length || 0) > 1;

  return (
    <div className={styles.tableViewSelector}>
      <Show when={!hidden}>
        {hasMultipleFilters ? (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: onMenuClickMemoized,
              className: styles.dropdownMenu,
            }}
            trigger={['click']}
            placement="bottomLeft"
            overlayClassName={styles.dropdownOverlay}
          >
            <div className={styles.clickableTitle}>
              {renderTitle()}
            </div>
          </Dropdown>
        ) : (
          <div className={styles.singleTitle}>
            {renderTitle()}
          </div>
        )}
      </Show>

      <Show when={Boolean(unevaluatedExpressions?.length)}>
        <Popover
          content={getPopoverHintContent}
          trigger="hover"
          title="Some fields have not been evaluated"
          placement="topRight"
        >
          <span className={styles.indexViewSelectorBulb}>
            <BulbTwoTone twoToneColor="orange" />
          </span>
        </Popover>
      </Show>
    </div>
  );
};

export default TableViewSelectorRenderer;
