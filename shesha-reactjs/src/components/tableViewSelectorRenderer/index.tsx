import React, { FC, useCallback, useMemo } from 'react';
import { BulbTwoTone, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Popover, Space, Tooltip, Typography } from 'antd';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import Show from '@/components/show';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';

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
}

export const TableViewSelectorRenderer: FC<ITableViewSelectorRendererProps> = ({
  filters,
  hidden,
  selectedFilterId,
  onSelectFilter,
}) => {
  const { styles } = useStyles();
  const getSelectedFilter = () => {
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

  const getPopoverHintContent = () => {
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
    [filters, onSelectFilter]
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

  const renderTitle = () => (
    <Typography.Title className="title" level={4}>
      {selectedFilter?.name}
    </Typography.Title>
  );

  return (
    <div className={styles.tableViewSelector}>
      <Space>
        <Show when={!hidden}>
          <Show when={filters?.length === 1}>{renderTitle()}</Show>
          <Show when={filters?.length > 1}>
            <Dropdown menu={{ items: menuItems, onClick: onMenuClickMemoized }} trigger={['click']}>
              <Space>
                {renderTitle()}
                <DownOutlined />
              </Space>
            </Dropdown>
          </Show>
        </Show>

        <Show when={Boolean(unevaluatedExpressions?.length)}>
          <Popover content={getPopoverHintContent} trigger="hover" title="Some fields have not been evaluated">
            <span className={styles.indexViewSelectorBulb}>
              <BulbTwoTone twoToneColor="orange" />
            </span>
          </Popover>
        </Show>
      </Space>
    </div>
  );
};

export default TableViewSelectorRenderer;
