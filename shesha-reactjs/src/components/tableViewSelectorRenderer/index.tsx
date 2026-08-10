import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import { BulbTwoTone, DownOutlined, QuestionCircleOutlined, LayoutOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Popover, Space, Tooltip, Badge } from 'antd';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import Show from '@/components/show';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

type MenuItem = Required<MenuProps>['items'][number];

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
  filters?: IStoredFilter[] | undefined;
  hidden?: boolean | undefined;
  selectedFilterId?: string | undefined;
  onSelectFilter: (id?: string) => void;
  showIcon?: boolean | undefined;
}

export const TableViewSelectorRenderer: FC<ITableViewSelectorRendererProps> = ({
  filters = [],
  hidden,
  selectedFilterId,
  onSelectFilter,
  showIcon = true,
}) => {
  const { styles } = useStyles();
  const { formMode } = useShaFormInstance();
  const getSelectedFilter = (): IStoredFilter | null => {
    if (!isNonEmptyArray(filters))
      return null;

    return selectedFilterId ? filters.find(({ id }) => id === selectedFilterId) ?? null : filters[0];
  };

  const selectedFilter = getSelectedFilter();

  const { unevaluatedExpressions } = selectedFilter || {};

  const getPopoverHintContent = (): ReactNode => {
    if (unevaluatedExpressions) {
      return (
        <div style={{ width: 450 }}>
          <div>
            This filter has dynamic expressions which have not been evaluated. Below are the filters which have not been
            evaluated
          </div>

          <ul>
            {unevaluatedExpressions.map((item) => (
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
      onSelectFilter(info.key);
    },
    [onSelectFilter],
  );

  const menuItems = useMemo<MenuItem[]>(() => {
    return filters.map((filter) => {
      return {
        key: filter.id,
        label: (
          <Space>
            {filter.name}
            {!isNullOrWhiteSpace(filter.tooltip) && <TooltipIcon tooltip={filter.tooltip}></TooltipIcon>}
          </Space>
        ),
      };
    });
  }, [filters]);

  const renderTitle = (): React.JSX.Element => {
    const hasFilters = isNonEmptyArray(filters);
    const isActiveFilter = isDefined(selectedFilter?.expression);

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

  const hasMultipleFilters = filters.length > 1;

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
            classNames={{ root: styles.dropdownOverlay }}
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
