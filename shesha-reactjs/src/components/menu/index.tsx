import { ISidebarButton, ISidebarMenuItem } from "@/interfaces/sidebar";
import { convertJsonToCss, convertJsonToCssWithImportant, getSelectedKeys, normalizeUrl } from "@/utils";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Menu, MenuProps } from "antd";
import classNames from "classnames";
import React, {
  FC,
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
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher } from "@/providers/configurableActionsDispatcher";
import { useDeepCompareMemo } from "@/hooks/useDeepCompareMemo";
import { sidebarMenuItemToMenuItem } from "../sidebarMenu/utils";
import { evaluateString, useAvailableConstantsData } from "@/providers/form/utils";
import { isNavigationActionConfiguration, useShaRouting } from "@/providers/shaRouting";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMainMenu } from "@/providers/mainMenu";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

interface IProps {
  colors?: ILayoutColor | undefined;
  fontSize?: string | undefined;
  overflow: "dropdown" | "menu" | "scroll";
  style?: React.CSSProperties | undefined;
  itemStyle?: React.CSSProperties | undefined;
  padding?: { x: number; y: number } | undefined;
  dropdownPadding?: string | undefined;
  styleOnHover?: React.CSSProperties | undefined;
  styleOnSelected?: React.CSSProperties | undefined;
  styleOnSubMenu?: React.CSSProperties | undefined;
  menuItemStyle?: React.CSSProperties | undefined;
  width?: string | undefined;
  fontStyles?: React.CSSProperties | undefined;
  menuId?: string | undefined;
}

const isSidebarButton = (item: ISidebarMenuItem | undefined): item is ISidebarButton => {
  return isDefined(item) && item.itemType === "button";
};

type MenuItem = Required<MenuProps>['items'][number];

export const LayoutMenu: FC<IProps> = ({
  colors,
  fontSize,
  overflow,
  padding,
  dropdownPadding,
  style,
  itemStyle,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
  menuItemStyle,
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
    itemStyle: convertJsonToCss(itemStyle) ?? undefined,
    styleOnHover: convertJsonToCssWithImportant(styleOnHover) ?? undefined,
    styleOnSelected: convertJsonToCssWithImportant(styleOnSelected) ?? undefined,
    menuItemStyle: convertJsonToCss(menuItemStyle) ?? undefined,
    width,
    fontStyles,
  });

  const menuWrapperRef = useRef<HTMLDivElement>(null);

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
    padding: dropdownPadding,
    fontStyles,
    itemStyle,
    styleOnHover,
    styleOnSelected,
    styleOnSubMenu,
    menuItemStyle,
  });

  const [openedKeys, setOpenedKeys] = useLocalStorage<string[]>(
    "openedSidebarKeys",
    [],
  );

  const currentUrl = normalizeUrl(router.fullPath);

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
  // eslint-disable-next-line react-hooks/refs, react-hooks/exhaustive-deps
  }, [items?.length, current?.clientWidth]);


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
    void executeAction({
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
          if (isNavigationActionConfiguration(args)) {
            const url = getUrlFromNavigationRequest(args.actionArguments);
            const href = !isNullOrWhiteSpace(url)
              ? evaluateString(
                decodeURIComponent(url),
                executionContext,
              )
              : "";
            return href;
          }
          return "";
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
      const addDropdownClassName = (item: MenuItem): MenuItem => {
        if (!item) return item;

        const newItem = { ...item };

        if (newItem.type === "submenu" && newItem.children.length > 0) {
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

  const onOpenChange = (openKeys: string[]): void => {
    setOpenedKeys(openKeys);
  };

  const keys = isDefined(openedKeys) && openedKeys.length > 0 ? openedKeys : undefined;

  if (overflow === "menu")
    return (
      <div className={styles.menuContainer} style={style}>
        <Button type="link" icon={<MenuOutlined />} onClick={onClick} />
        <ShaMenuDrawer
          items={menuItems}
          open={open}
          onClose={onClose}
          colors={colors}
          padding={padding}
          fontStyles={fontStyles}
          itemStyle={itemStyle}
          styleOnHover={styleOnHover}
          styleOnSelected={styleOnSelected}
          styleOnSubMenu={styleOnSubMenu}
          menuItemStyle={menuItemStyle}
          menuId={menuId}
        />
      </div>
    );

  return (
    <div className={styles.menuContainer} style={style}>
      {menuId ? (
        <ScopedMenuStyles
          colors={colors}
          padding={padding}
          itemStyle={convertJsonToCss(itemStyle)}
          styleOnHover={convertJsonToCssWithImportant(styleOnHover)}
          styleOnSelected={convertJsonToCssWithImportant(styleOnSelected)}
          styleOnSubMenu={convertJsonToCssWithImportant(styleOnSubMenu)}
          menuItemStyle={convertJsonToCss(menuItemStyle)}
          fontStyles={fontStyles}
          menuId={menuId}
        />
      ) : (
        <GlobalMenuStyles
          colors={colors}
          padding={padding}
          itemStyle={convertJsonToCss(itemStyle)}
          styleOnHover={convertJsonToCssWithImportant(styleOnHover)}
          styleOnSelected={convertJsonToCssWithImportant(styleOnSelected)}
          styleOnSubMenu={convertJsonToCssWithImportant(styleOnSubMenu)}
          menuItemStyle={convertJsonToCss(menuItemStyle)}
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
          {...(keys ? { defaultOpenKeys: keys } : {})}
          items={menuItems}
          onOpenChange={onOpenChange}
          selectedKeys={getSelectedKeys(router.fullPath, items ?? [])}
          overflowedIndicator={<OverflowedIndicator className={styles.shaHamburgerItem} />}
          {...(menuId ? { overflowedIndicatorPopupClassName: `horizontal-menu-${menuId}-dropdown` } : {})}
          disabledOverflow={isScrolling}
          style={{ background: 'none' }}
        />
      </div>

      {isScrolling && hasOverflow && (
        <ScrollControls
          scrollButtonClassName={styles.scrollButton}
          scrollButtonsClassName={styles.scrollButtons}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
          containerStyle={style}
        />
      )}
    </div>
  );
};

export default LayoutMenu;
