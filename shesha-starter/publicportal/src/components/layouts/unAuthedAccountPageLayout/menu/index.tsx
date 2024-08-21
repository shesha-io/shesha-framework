import { MenuOutlined } from "@ant-design/icons";
import {
  SidebarMenu,
  useConfigurableActionDispatcher,
  IConfigurableActionConfiguration,
  useSidebarMenu,
  useShaRouting,
  evaluateString,
  useAvailableConstantsData,
} from "@shesha-io/reactjs";
import { Button, Menu } from "antd";
import React, { FC, useState } from "react";
import ShaMenuDrawer from "../menuDrawer/index";
import { useStyles } from "./styles";

interface IProps {}

export const LayoutMenu: FC<IProps> = () => {
  const { styles } = useStyles();

  const [{ open }, setState] = useState({ open: false });
  const onClick = () => setState((s) => ({ ...s, open: true }));
  const onClose = () => setState((s) => ({ ...s, open: false }));

  const { getUrlFromNavigationRequest } = useShaRouting();

  const { executeAction } = useConfigurableActionDispatcher();
  const {executionContext, evaluationContext} = useAvailableConstantsData();
  const { getItems, isItemVisible } = useSidebarMenu();
  const items = getItems();

  const onButtonClick = (
    itemId: string,
    actionConfiguration: IConfigurableActionConfiguration
  ) => {
    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: executionContext,
    });
  };

  const menuItems = items.map((item) =>
    SidebarMenu.sidebarItemToMenuItem({
      item,
      isItemVisible,
      onButtonClick,
      isRootItem: true,
      getFormUrl: (args) => {
        const url = getUrlFromNavigationRequest(args?.actionArguments);
        const href = evaluateString(decodeURIComponent(url), evaluationContext);
        return href;
      },
      getUrl: (url) => {
        const href = evaluateString(decodeURIComponent(url), evaluationContext);
        return href;
      },
    })
  );

  return menuItems.length <= 20 ? (
    <Menu
      className={styles.shaMenu}
      mode="horizontal"
      items={menuItems}
      overflowedIndicator={
        <span className={styles.shaHamburgerItem}>
          <MenuOutlined /> Menu
        </span>
      }
    />
  ) : (
    <>
      <Button type="link" icon={<MenuOutlined />} onClick={onClick} />
      <ShaMenuDrawer items={menuItems} open={open} onClose={onClose} />
    </>
  );
};
