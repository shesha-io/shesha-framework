import {
  IConfigurableActionConfiguration,
  convertJsonToCss,
  evaluateString,
  isNavigationActionConfiguration,
  normalizeUrl,
  sidebarMenuItemToMenuItem,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useDeepCompareMemo,
  useLocalStorage,
  useMainMenu,
  useShaRouting,
} from "@/index";
import { ISidebarButton, ISidebarMenuItem } from "@/interfaces/sidebar";
import { getSelectedKeys } from "@/utils";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import classNames from "classnames";
import React, {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ShaMenuDrawer from "../menuDrawer";
import { ILayoutColor } from "./model";
import OverflowedIndicator, { getMutatedMenuItem } from "./overflowedIndicator";
import { ScrollControls } from "./scrolls";
import { GlobalMenuStyles, ScopedMenuStyles, useStyles } from "./styles";
import { useHorizontalMenuDropdownStyles } from "./useHorizontalMenuDropdownStyles";

interface IProps {
  colors?: ILayoutColor;
  fontSize?: string;
  overflow: "dropdown" | "menu" | "scroll";
  style?: React.CSSProperties;
  padding?: { x: string; y: string };
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
  width?: string;
  fontStyles?: React.CSSProperties;
  menuId?: string;
}

const isSidebarButton = (item: ISidebarMenuItem): item is ISidebarButton => {
  return item && item.itemType === "button";
};

export const LayoutMenu: FC<IProps> = ({
  colors,
  fontSize,
  overflow,
  padding,
  style,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
  width,
  fontStyles,
  menuId,
}) => {
  const isScrolling = overflow === "scroll";
  const { styles } = useStyles({
    colors,
    fontSize,
    isScrolling,
    padding,
    styleOnHover: convertJsonToCss(styleOnHover),
    styleOnSelected: convertJsonToCss(styleOnSelected),
    width,
    fontStyles,
  });

  const menuWrapperRef = useRef(null);

  const { current } = menuWrapperRef;

  const [{ hasOverflow, open }, setState] = useState({
    hasOverflow: true,
    open: false,
  });

  const { getUrlFromNavigationRequest, router } = useShaRouting();
  const { executeAction } = useConfigurableActionDispatcher();
  const executionContext = useAvailableConstantsData();
  const { items } = useMainMenu();

  useHorizontalMenuDropdownStyles({
    menuId,
    colors,
    fontStyles,
    styleOnSubMenu,
  });

  const [openedKeys, setOpenedKeys] = useLocalStorage(
    "openedSidebarKeys",
    null,
  );

  const currentUrl = normalizeUrl(router?.fullPath);

  const [selectedKey, setSelectedKey] = useState<string>();

  const initialSelection = useRef<string>(undefined);

  const checkOverflow = (): void => {
    if (current) {
      setState((s) => ({
        ...s,
        hasOverflow: current.scrollWidth > current.clientWidth,
      }));
    }
  };

  useEffect(() => {
    checkOverflow();

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [items.length, current?.clientWidth]);


  const scrollRight = useCallback(() => {
    if (menuWrapperRef.current) {
      menuWrapperRef.current.scrollLeft += 200;
    }
  }, []);

  const scrollLeft = useCallback(() => {
    if (menuWrapperRef.current) {
      menuWrapperRef.current.scrollLeft -= 200;
    }
  }, []);

  const onClick = (): void => setState((s) => ({ ...s, open: true }));
  const onClose = (): void => setState((s) => ({ ...s, open: false }));

  const onButtonClick = (
    _itemId: string,
    actionConfiguration: IConfigurableActionConfiguration,
  ): void => {
    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: executionContext,
    });
  };

  const menuItems = useDeepCompareMemo(() => {
    const processedItems = (items ?? []).map((item) =>
      sidebarMenuItemToMenuItem({
        item: getMutatedMenuItem(item),
        onButtonClick,
        getFormUrl: (args) => {
          const url = getUrlFromNavigationRequest(args?.actionArguments);
          const href = evaluateString(
            decodeURIComponent(url),
            executionContext,
          );
          return href;
        },
        getUrl: (url) => {
          const href = evaluateString(
            decodeURIComponent(url),
            executionContext,
          );
          return href;
        },
        onItemEvaluation: (nestedItem) => {
          if (
            initialSelection.current === undefined &&
            isSidebarButton(nestedItem) &&
            isNavigationActionConfiguration(nestedItem.actionConfiguration)
          ) {
            const url = getUrlFromNavigationRequest(
              nestedItem.actionConfiguration.actionArguments,
            );

            if (url && normalizeUrl(url) === currentUrl) {
              initialSelection.current = nestedItem.id;
              if (!selectedKey) setSelectedKey(nestedItem.id);
            }
          }
        },
      }),
    );

    if (menuId) {
      const addDropdownClassName = (item: any): any => {
        if (!item) return item;

        const newItem = { ...item };

        if (newItem.children && newItem.children.length > 0) {
          newItem.popupClassName = `horizontal-menu-${menuId}-dropdown`;
          newItem.children = newItem.children.map(addDropdownClassName);
        }

        return newItem;
      };

      return processedItems.map(addDropdownClassName);
    }

    return processedItems;
  }, [items, executionContext, menuId]);

  if (menuItems.length === 0) return null;

  const onOpenChange = (openKeys: React.Key[]): void => {
    setOpenedKeys(openKeys);
  };

  const keys = openedKeys && openedKeys.length > 0 ? openedKeys : undefined;

  if (overflow === "menu")
    return (
      <Fragment>
        <Button type="link" icon={<MenuOutlined />} onClick={onClick} />
        <ShaMenuDrawer
          items={menuItems}
          open={open}
          onClose={onClose}
          colors={colors}
          fontStyles={fontStyles}
          styleOnSubMenu={styleOnSubMenu}
          menuId={menuId}
        />
      </Fragment>
    );

  return (
    <div className={styles.menuContainer}>
      {menuId ? (
        <ScopedMenuStyles
          colors={colors}
          styleOnSubMenu={convertJsonToCss(styleOnSubMenu)}
          fontStyles={fontStyles}
          menuId={menuId}
        />
      ) : (
        <GlobalMenuStyles
          colors={colors}
          styleOnSubMenu={convertJsonToCss(styleOnSubMenu)}
          fontStyles={fontStyles}
        />
      )}
      <div
        className={classNames(
          styles.menuWrapper,
          styles.menuWrapperScroll,
          menuId ? `horizontal-menu-${menuId}` : undefined,
        )}
        ref={menuWrapperRef}
      >
        <Menu
          mode="horizontal"
          className={styles.shaMenu}
          defaultOpenKeys={keys}
          items={menuItems}
          onOpenChange={onOpenChange}
          selectedKeys={getSelectedKeys(router?.fullPath, items)}
          overflowedIndicator={
            <OverflowedIndicator className={styles.shaHamburgerItem} />
          }
          overflowedIndicatorPopupClassName={menuId ? `horizontal-menu-${menuId}-dropdown` : undefined}
          disabledOverflow={isScrolling}
          style={style}
        />
      </div>

      {isScrolling && hasOverflow && (
        <ScrollControls
          styles={styles}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
        />
      )}
    </div>
  );
};

export default LayoutMenu;
