import React, { FC, useRef, useState } from 'react';
import { normalizeUrl } from '@/utils/url';
import { isSidebarButton } from '@/interfaces/sidebar';
import { IConfigurableActionConfiguration, isNavigationActionConfiguration, useConfigurableActionDispatcher, useShaRouting } from '@/providers/index';
import { Menu } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { sidebarMenuItemToMenuItem } from './utils';
import { evaluateString, useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo, useLocalStorage } from '@/hooks';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { useMainMenu } from '@/providers/mainMenu';

export interface ISidebarMenuProps {
  isCollapsed?: boolean;
  theme?: MenuTheme;
}

const SidebarMenu: FC<ISidebarMenuProps> = ({ theme = 'dark' }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('openedSidebarKeys', null);
  const { items } = useMainMenu();
  const { executeAction } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest, router } = useShaRouting();
  const executionContext = useAvailableConstantsData();

  const { styles } = useStyles();

  const currentUrl = normalizeUrl(router?.fullPath);

  const [selectedKey, setSelectedKey] = useState<string>();

  const initialSelection = useRef<string>(undefined);

  const onButtonClick = (itemId: string, actionConfiguration: IConfigurableActionConfiguration): void => {
    setSelectedKey(itemId);
    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: executionContext,
    });
  };

  const menuItems = useDeepCompareMemo(() => {
    return (items ?? []).map((item) =>
      sidebarMenuItemToMenuItem({
        item,
        onButtonClick,
        getFormUrl: (args) => {
          const url = getUrlFromNavigationRequest(args?.actionArguments);
          const href = evaluateString(decodeURIComponent(url), executionContext);
          return href;
        },
        getUrl: (url) => {
          const href = evaluateString(decodeURIComponent(url), executionContext);
          return href;
        },
        onItemEvaluation: (nestedItem) => {
          if (initialSelection.current === undefined && isSidebarButton(nestedItem) && isNavigationActionConfiguration(nestedItem.actionConfiguration)) {
            const url = getUrlFromNavigationRequest(nestedItem.actionConfiguration.actionArguments);

            if (url && normalizeUrl(url) === currentUrl) {
              initialSelection.current = nestedItem.id;
              if (!selectedKey)
                setSelectedKey(nestedItem.id);
            }
          }
        },
      }),
    );
  }, [items, { ...executionContext }]); // use spread to get the values of the ObservableProxy fields

  if (menuItems.length === 0) return null;

  const onOpenChange = (openKeys: React.Key[]): void => {
    setOpenedKeys(openKeys);
  };

  const keys = openedKeys && openedKeys.length > 0 ? openedKeys : undefined;

  return (
    <Menu
      mode="inline"
      className={classNames(styles.shaSidebarMenu, "nav-links-renderer")}
      defaultOpenKeys={keys}
      selectedKeys={selectedKey ? [selectedKey] : undefined}
      onOpenChange={onOpenChange}
      theme={theme}
      items={menuItems}
    />
  );
};

type InternalSidebarMenuType = typeof SidebarMenu;
interface IInternalSidebarMenuType extends InternalSidebarMenuType {
  sidebarItemToMenuItem: typeof sidebarMenuItemToMenuItem;
}

const SidebarMenuInterface = SidebarMenu as IInternalSidebarMenuType;
SidebarMenuInterface.sidebarItemToMenuItem = sidebarMenuItemToMenuItem;

export { SidebarMenuInterface as SidebarMenu };
