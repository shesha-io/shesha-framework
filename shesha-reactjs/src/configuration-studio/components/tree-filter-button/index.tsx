/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { FilterOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { FC, useMemo, useState } from 'react';
import { useCsTree } from '@/configuration-studio/cs/hooks';
import { useStyles } from '@/configuration-studio/styles';

type MenuItems = Required<MenuProps>['items'];

const CLEAR_KEY = '__clear-all__';

/** Joins the active type names into a readable list: "A", "A and B", "A, B, and C". */
const TYPE_LIST_FORMATTER = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

export const TreeFilterButton: FC = () => {
  const { itemTypes, itemTypeFilter, setItemTypeFilter } = useCsTree();
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const menuItems = useMemo<MenuItems>(() => {
    const typeItems: MenuItems = itemTypes.map((it) => ({
      key: it.itemType,
      icon: it.icon,
      label: it.friendlyName,
    }));

    if (typeItems.length === 0)
      return [];

    return [
      ...typeItems,
      { type: 'divider' },
      {
        key: CLEAR_KEY,
        label: 'Clear filter',
        disabled: itemTypeFilter.length === 0,
      },
    ];
  }, [itemTypes, itemTypeFilter]);

  const onMenuClick: Required<MenuProps>['onClick'] = ({ key }) => {
    if (key === CLEAR_KEY) {
      setItemTypeFilter([]);
      return;
    }

    // Toggle the clicked type, keeping the stored order aligned with `itemTypes`.
    const next = itemTypeFilter.includes(key)
      ? itemTypeFilter.filter((t) => t !== key)
      : [...itemTypeFilter, key];
    setItemTypeFilter(next);
  };

  if (itemTypes.length === 0)
    return null;

  const isFiltered = itemTypeFilter.length > 0;

  // Name the active types, in menu order rather than the order they were clicked. Unknown
  // types (e.g. a filter restored from storage after a type was unregistered) are skipped.
  const selectedNames = itemTypes
    .filter((it) => itemTypeFilter.includes(it.itemType))
    .map((it) => it.friendlyName);

  // "A", "A and B", "A, B, and C".
  const tooltipTitle = selectedNames.length > 0
    ? `Showing ${TYPE_LIST_FORMATTER.format(selectedNames)} only`
    : 'Filter by type';

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: menuItems,
        selectable: true,
        multiple: true,
        selectedKeys: itemTypeFilter,
        onClick: onMenuClick,
      }}
    >
      <Tooltip title={tooltipTitle}>
        <Badge count={itemTypeFilter.length} size="small" offset={[-2, 2]}>
          <Button
            className={styles.csTreeFilterButton}
            icon={<FilterOutlined />}
            type={isFiltered ? 'primary' : 'default'}
            aria-label="Filter by type"
            size="small"
          />
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};
