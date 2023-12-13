import React, { FC, useState } from 'react';
import { Menu } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { useLocalStorage } from '../../hooks';
import { useSidebarMenu } from '@/providers/sidebarMenu';
import { renderSidebarMenuItem } from './utils';
import { useConfigurableActionDispatcher } from '@/providers/index';
import { useApplicationContext } from '@/utils/publicUtils';
import { ISidebarButton } from '@/interfaces/sidebar';

export interface ISidebarMenuProps {
  isCollapsed?: boolean;
  theme?: MenuTheme;
}

export const SidebarMenu: FC<ISidebarMenuProps> = ({ theme = 'dark' }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('openedSidebarKeys', null);
  const [selectedKey, setSelectedKey] = useState<string>();
  const { getItems, isItemVisible } = useSidebarMenu();
  const { executeAction } = useConfigurableActionDispatcher();
  const executionContext = useApplicationContext();

  const items = getItems();

  if ((items ?? []).length === 0) return null;

  const onOpenChange = (openKeys: React.Key[]) => {
    setOpenedKeys(openKeys);
  };

  const keys = openedKeys && openedKeys.length > 0 ? openedKeys : undefined;

  const onButtonClick = (item: ISidebarButton) => {
    setSelectedKey(item.id);
    executeAction({ 
      actionConfiguration: item.actionConfiguration,
      argumentsEvaluationContext: executionContext
    });
  };

  return (
    <Menu
      mode="inline"
      className="nav-links-renderer sha-sidebar-menu"
      defaultOpenKeys={keys}
      selectedKeys={selectedKey ? [selectedKey] : undefined}
      onOpenChange={onOpenChange}
      theme={theme}
      items={items.map((item) =>
        renderSidebarMenuItem({ item, isItemVisible, onButtonClick, isRootItem: true })
      )}
    />
  );
};

export default SidebarMenu;
