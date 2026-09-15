/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { FilterOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { FC, useMemo, useState } from 'react';
import { useCsTree } from '@/configuration-studio/cs/hooks';
import { useStyles } from '@/configuration-studio/styles';

type MenuItems = Required<MenuProps>['items'];

const CLEAR_KEY = '__clear-all__';

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
      <Tooltip title={isFiltered ? `Filtered by ${itemTypeFilter.length} type(s)` : 'Filter by type'}>
        <Badge count={itemTypeFilter.length} size="small" offset={[-2, 2]}>
          <Button
            className={styles.csTreeFilterButton}
            icon={<FilterOutlined />}
            type={isFiltered ? 'primary' : 'default'}
            aria-label="Filter by type"
          />
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};
