import React, { FC, useRef, useState } from 'react';
import { normalizeUrl } from '@/utils/url';
import { ISidebarButton, isSidebarButton } from '@/interfaces/sidebar';
import { isNavigationActionConfiguration, useConfigurableActionDispatcher, useShaRouting } from '@/providers/index';
import { Menu } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { renderSidebarMenuItem } from './utils';
import { useApplicationContext } from '@/utils/publicUtils';
import { useLocalStorage } from '../../hooks';
import { useSidebarMenu } from '@/providers/sidebarMenu';

export interface ISidebarMenuProps {
  isCollapsed?: boolean;
  theme?: MenuTheme;
}

export const SidebarMenu: FC<ISidebarMenuProps> = ({ theme = 'dark' }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('openedSidebarKeys', null);
  const { getItems, isItemVisible } = useSidebarMenu();
  const { executeAction } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest, router } = useShaRouting();
  const executionContext = useApplicationContext();

  const currentUrl = normalizeUrl(router?.asPath);

  const [selectedKey, setSelectedKey] = useState<string>();

  const items = getItems();
  const initialSelection = useRef<string>(undefined);

  if ((items ?? []).length === 0) return null;

  const onButtonClick = (item: ISidebarButton) => {
    setSelectedKey(item.id);
    executeAction({
      actionConfiguration: item.actionConfiguration,
      argumentsEvaluationContext: executionContext
    });
  };

  const menuItems = items.map((item) =>
    renderSidebarMenuItem({
      item,
      isItemVisible,
      onButtonClick,
      isRootItem: true,
      onItemEvaluation: (nestedItem) => {
        if (initialSelection.current === undefined && isSidebarButton(nestedItem) && isNavigationActionConfiguration(nestedItem.actionConfiguration)){
          const url = getUrlFromNavigationRequest(nestedItem.actionConfiguration.actionArguments);

          if (url && normalizeUrl(url) === currentUrl){
            initialSelection.current = nestedItem.id;
            if (!selectedKey)
              setSelectedKey(nestedItem.id);
          }
        }
      },
    })
  );

  const onOpenChange = (openKeys: React.Key[]) => {
    setOpenedKeys(openKeys);
  };

  const keys = openedKeys && openedKeys.length > 0 ? openedKeys : undefined;

  return (
    <Menu
      mode="inline"
      className="nav-links-renderer sha-sidebar-menu"
      defaultOpenKeys={keys}
      selectedKeys={selectedKey ? [selectedKey] : undefined}
      onOpenChange={onOpenChange}
      theme={theme}
      items={menuItems}
    />
  );
};

export default SidebarMenu;
