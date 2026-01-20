import LayoutMenu from "@/components/menu";
import { ILayoutColor } from "@/components/menu/model";
import { filterObjFromKeys } from "@/utils";
import { EditOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  ConfigurableComponentRenderer,
  getShadowStyle,
  getStyle,
  IConfigurableFormComponent,
  ISidebarMenuItem,
  IToolboxComponent,
  migratePrevStyles,
  useFormData,
  useMainMenu,
  validateConfigurableComponentSettings,
} from '@/index';
import React, { CSSProperties, useMemo } from 'react';
import { IConfigurableComponentContext } from '@/providers/configurableComponent/contexts';
import { ItemType } from "antd/es/menu/interface";

import Editor from "./modal";
import { getSettings } from "./settings";
import { defaultStyles } from "./utils";

interface IMenuListProps extends IConfigurableFormComponent, ILayoutColor {
  items?: ItemType[];
  overflow?: "dropdown" | "menu" | "scroll";
  fontSize?: string;
  gap?: string;
  height?: string;
  containerStyle?: string;
  styleOnHover?: string;
  styleOnSelected?: string;
  styleOnSubMenu?: string;
  width?: string;
  dimensions?: {
    width?: string;
    height?: string;
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
  };
  font?: {
    type?: string;
    size?: number;
    weight?: string;
    color?: string;
    align?: string;
  };
  background?: {
    type?: string;
    color?: string;
  };
  menuItemShadow?: {
    color: string;
    offsetX?: number;
    offsetY?: number;
    blurRadius?: number;
    spreadRadius?: number;
  };
}

interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
}

export const MenuListComponent: IToolboxComponent<IMenuListProps> = {
  type: "menuList",
  name: "Menu List",
  isInput: false,
  isOutput: false,
  icon: <MenuUnfoldOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { loadedMenu, changeMainMenu, saveMainMenu } = useMainMenu();

    const context: IConfigurableComponentContext<ISideBarMenuProps> = {
      settings: loadedMenu,
      load: () => { /* do nothing */ },
      save: (settings: ISideBarMenuProps) =>
        saveMainMenu({ ...loadedMenu, ...settings }).then(() => {
          changeMainMenu({ ...loadedMenu, ...settings });
        }),
      setIsInProgressFlag: () => { /* do nothing */ },
      setSucceededFlag: () => { /* do nothing */ },
      setFailedFlag: () => { /* do nothing */ },
      setActionedFlag: () => { /* do nothing */ },
      resetIsInProgressFlag: () => { /* do nothing */ },
      resetSucceededFlag: () => { /* do nothing */ },
      resetFailedFlag: () => { /* do nothing */ },
      resetActionedFlag: () => { /* do nothing */ },
      resetAllFlag: () => { /* do nothing */ },
    };

    const fontSize = model?.font?.size || model?.fontSize || "14";
    const gap = model?.gap || "12";
    const height = model?.height || "6";

    // Normalize width: if no unit provided, append 'px'
    const rawWidth = model?.dimensions?.width || model?.width || "500px";
    const width = /^\d+$/.test(rawWidth) ? `${rawWidth}px` : rawWidth;

    const colors: ILayoutColor = {
      ...filterObjFromKeys(model, [
        "selectedItemColor",
        "selectedItemBackground",
        "itemColor",
        "itemBackground",
        "hoverItemColor",
        "hoverItemBackground",
        "subItemColor",
        "subItemBackground",
      ]),
    };

    const finalContainerStyle = useMemo(() => {
      const computedStyle = {
        ...model.allStyles?.fullStyle,
        ...model.allStyles?.backgroundStyles,
        ...(model.containerStyle ? getStyle(model.containerStyle, data) : {}),
      };

      // Set default background color if not defined
      if (!computedStyle.backgroundColor && !computedStyle.background) {
        computedStyle.backgroundColor = '#ffffff';
      }

      return computedStyle;
    }, [model.allStyles, model.containerStyle, data]);

    const finalFontStyles = useMemo(() => {
      return {
        fontSize: model?.font?.size ? `${model.font.size}px` : `${fontSize}px`,
        fontFamily: model?.font?.type,
        fontWeight: model?.font?.weight as CSSProperties['fontWeight'],
        color: model?.font?.color,
        textAlign: model?.font?.align as any,
      };
    }, [model.font, fontSize]);

    const menuItemShadowStyle = useMemo(() => {
      return getShadowStyle(model?.menuItemShadow);
    }, [model?.menuItemShadow]);

    if (model.hidden) return null;

    return (
      <ConfigurableComponentRenderer
        canConfigure={true}
        contextAccessor={() => context}
        settingsEditor={{ render: Editor }}
      >
        {(componentState, BlockOverlay) => {
          return (
            <div className={`sidebar ${componentState.wrapperClassName}`}>
              <BlockOverlay>
                <EditOutlined className="sha-configurable-sidemenu-button-wrapper" />
              </BlockOverlay>
              <LayoutMenu
                colors={colors}
                fontSize={typeof fontSize === 'string' ? fontSize : String(fontSize)}
                padding={{ x: gap, y: height }}
                style={{
                  ...finalContainerStyle,
                  ...finalFontStyles,
                  width: width,
                } as React.CSSProperties}
                itemStyle={getStyle(model?.style, data)}
                styleOnHover={getStyle(model?.styleOnHover, data)}
                styleOnSelected={getStyle(model?.styleOnSelected, data)}
                styleOnSubMenu={getStyle(model?.styleOnSubMenu, data)}
                menuItemStyle={menuItemShadowStyle}
                overflow={model.overflow || 'dropdown'}
                width={width}
                fontStyles={finalFontStyles as React.CSSProperties}
                menuId={model.id}
              />
            </div>
          );
        }}
      </ConfigurableComponentRenderer>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IMenuListProps>(0, (prev) => ({
      ...migratePrevStyles(prev, defaultStyles()),
    }))
    .add<IMenuListProps>(1, (prev) => ({
      ...prev,
      overflow: prev.overflow ?? 'dropdown',
    })),
};

export default MenuListComponent;
