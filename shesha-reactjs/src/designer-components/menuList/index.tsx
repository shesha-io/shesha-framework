import {
  ConfigurableComponentRenderer,
  getStyle,
  IConfigurableFormComponent,
  ISidebarMenuItem,
  IToolboxComponent,
  useFormData,
  useMainMenu,
  validateConfigurableComponentSettings,
} from "@/index";
import { ItemType } from "antd/es/menu/interface";
import React from "react";
import Editor from "./modal";
import { getSettings } from "./settings";
import { filterObjFromKeys } from "../childEntitiesTagGroup/utils";
import { ILayoutColor } from "@/components/menu/model";
import { IConfigurableComponentContext } from "@/providers/configurableComponent/contexts";
import { RebaseEditOutlined } from "./icons";
import LayoutMenu from "@/components/menu";
import { MenuUnfoldOutlined } from "@ant-design/icons";

interface IMenuListProps extends IConfigurableFormComponent, ILayoutColor {
  items?: ItemType[];
  overflow: "dropdown" | "menu" | "scroll";
  fontSize?: string;
  gap?: string;
  height?: string;
  styleOnHover?: string;
  styleOnSelected?: string;
  styleOnSubMenu?: string;
  width?: string;
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
      load: () => {},
      save: (settings: ISideBarMenuProps) =>
        saveMainMenu({ ...loadedMenu, ...settings }).then(() => {
          changeMainMenu({ ...loadedMenu, ...settings });
        }),
      setIsInProgressFlag: () => {},
      setSucceededFlag: () => {},
      setFailedFlag: () => {},
      setActionedFlag: () => {},
      resetIsInProgressFlag: () => {},
      resetSucceededFlag: () => {},
      resetFailedFlag: () => {},
      resetActionedFlag: () => {},
      resetAllFlag: () => {},
    };

    const { fontSize = "14", gap = "12", height = "6" } = model;

    const colors: ILayoutColor = filterObjFromKeys(model, [
      "selectedItemColor",
      "selectedItemBackground",
      "itemColor",
      "itemBackground",
      "hoverItemColor",
      "hoverItemBackground",
    ]);

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
                <RebaseEditOutlined className="sha-configurable-sidemenu-button-wrapper" />
              </BlockOverlay>
              <LayoutMenu
                colors={colors}
                fontSize={fontSize}
                padding={{ x: gap, y: height }}
                style={getStyle(model?.style, data)}
                styleOnHover={getStyle(model?.styleOnHover, data)}
                styleOnSelected={getStyle(model?.styleOnSelected, data)}
                styleOnSubMenu={getStyle(model?.styleOnSubMenu, data)}
                overflow={model.overflow}
                width={model?.width}
              />
            </div>
          );
        }}
      </ConfigurableComponentRenderer>
    );
  },
  initModel: (model) => ({
    ...model,
    fontSize: "14",
    gap: "12",
    height: "6",
    overflow: "dropdown",
    width: "500px",
    menuItemColor: "#000",
    hoverItemColor: "#000",
  }),
  settingsFormMarkup: model => getSettings(model),
  validateSettings: (model) =>
    validateConfigurableComponentSettings(getSettings(model), model),
};

export default MenuListComponent;
