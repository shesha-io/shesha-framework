import React, { FC } from 'react';
import { Menu } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { useLocalStorage } from '../../hooks';
import { useSidebarMenu } from '@/providers/sidebarMenu';
import { renderSidebarMenuItem } from './utils';
import { useConfigurableActionDispatcher } from '@/providers/index';
import { useApplicationContext } from '@/utils/publicUtils';

export interface ISidebarMenuProps {
  isCollapsed?: boolean;
  theme?: MenuTheme;
}

export const SidebarMenu: FC<ISidebarMenuProps> = ({ theme = 'dark' }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('openedSidebarKeys', null);
  const { getItems, isItemVisible } = useSidebarMenu();
  const { executeAction } = useConfigurableActionDispatcher();
  const executionContext = useApplicationContext();

  const items = getItems();

  if ((items ?? []).length === 0) return null;

  const onOpenChange = (openKeys: React.Key[]) => {
    setOpenedKeys(openKeys);
  };

  const keys = openedKeys && openedKeys.length > 0 ? openedKeys : undefined;

  return (
    <Menu
      mode="inline"
      className="nav-links-renderer sha-sidebar-menu"
      defaultOpenKeys={keys}
      onOpenChange={onOpenChange}
      theme={theme}
      items={items.map((item) =>
        renderSidebarMenuItem({ item, isItemVisible, actionExecuter: executeAction, executionContext, isRootItem: true })
      )}
    />
  );
};

export default SidebarMenu;
