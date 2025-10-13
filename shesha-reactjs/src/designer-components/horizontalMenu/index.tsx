import LayoutMenu from "@/components/menu";
import { ILayoutColor } from "@/components/menu/model";
import { filterObjFromKeys } from "@/utils";
import { EditOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  ConfigurableComponentRenderer,
  getStyle,
  IConfigurableFormComponent,
  ISidebarMenuItem,
  IToolboxComponent,
  migratePrevStyles,
  useFormData,
  useMainMenu,
  validateConfigurableComponentSettings,
} from '@/index';
import React, { useMemo } from 'react';
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
    const width = model?.dimensions?.width || model?.width || "500px";

    const colors: ILayoutColor = {
      ...filterObjFromKeys(model, [
        "selectedItemColor",
        "selectedItemBackground",
        "itemColor",
        "itemBackground",
        "hoverItemColor",
        "hoverItemBackground",
      ]),
      itemBackground: model.background?.color || model.itemBackground,
      itemColor: model.font?.color || model.itemColor,
    };

    const finalStyle = useMemo(() => {
      return {
        ...model.allStyles?.fullStyle,
        ...(model.style ? getStyle(model.style, data) : {}),
      };
    }, [model.allStyles, model.style, data]);

    const finalFontStyles = useMemo(() => {
      return {
        fontSize: model?.font?.size ? `${model.font.size}px` : `${fontSize}px`,
        fontFamily: model?.font?.type,
        fontWeight: model?.font?.weight as any,
        color: model?.font?.color,
        textAlign: model?.font?.align as any,
      };
    }, [model.font, fontSize]);

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
                  ...finalStyle,
                  ...finalFontStyles,
                  width: width,
                } as React.CSSProperties}
                styleOnHover={getStyle(model?.styleOnHover, data)}
                styleOnSelected={getStyle(model?.styleOnSelected, data)}
                styleOnSubMenu={getStyle(model?.styleOnSubMenu, data)}
                overflow={model.overflow}
                width={width}
                fontStyles={finalFontStyles as React.CSSProperties}
                menuId={`horizontal-menu-${model.id}`}
              />
            </div>
          );
        }}
      </ConfigurableComponentRenderer>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IMenuListProps>(0, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default MenuListComponent;
