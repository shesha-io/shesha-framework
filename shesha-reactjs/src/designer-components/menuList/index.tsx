import {
  ConfigurableComponentRenderer,
  getStyle,
  IConfigurableFormComponent,
  ISidebarMenuItem,
  IStyleType,
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
import { useFormComponentStyles } from "@/hooks/formComponentHooks";
import { migratePrevStyles } from "../_common-migrations/migrateStyles";
import { defaultStyles } from "./utils";

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
  // Add IStyleType properties explicitly to avoid conflicts
  border?: any;
  background?: any;
  font?: any;
  shadow?: any;
  dimensions?: any;
  stylingBox?: string;
}

// Type for useFormComponentStyles hook
type MenuListStyleProps = IMenuListProps & IStyleType & Omit<IConfigurableFormComponent, 'id' | 'type'>;

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
    const allStyles = useFormComponentStyles(model as MenuListStyleProps);

    const context: IConfigurableComponentContext<ISideBarMenuProps> = {
      settings: loadedMenu,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      load: () => {},
      save: (settings: ISideBarMenuProps) =>
        saveMainMenu({ ...loadedMenu, ...settings }).then(() => {
          changeMainMenu({ ...loadedMenu, ...settings });
        }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setIsInProgressFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setSucceededFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setFailedFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setActionedFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      resetIsInProgressFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      resetSucceededFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      resetFailedFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      resetActionedFlag: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      resetAllFlag: () => {},
    };

    const { gap = "12", height = "auto" } = model;

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
            <div className={`sidebar ${componentState.wrapperClassName}`} style={allStyles.fullStyle}>
              <BlockOverlay>
                <RebaseEditOutlined className="sha-configurable-sidemenu-button-wrapper" />
              </BlockOverlay>
              <LayoutMenu
                colors={colors}
                padding={{ x: gap, y: height }}
                style={getStyle(model?.style, data)}
                styleOnHover={getStyle(model?.styleOnHover, data)}
                styleOnSelected={getStyle(model?.styleOnSelected, data)}
                styleOnSubMenu={getStyle(model?.styleOnSubMenu, data)}
                overflow={model.overflow}
                width={model?.width}
                fontStyles={allStyles.fontStyles}
              />
            </div>
          );
        }}
      </ConfigurableComponentRenderer>
    );
  },
  initModel: (model) => ({
    ...model,
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
  migrator: (m) => m
    .add<IMenuListProps>(0, (prev) => ({ ...prev, overflow: 'dropdown' }))
    .add<IMenuListProps>(1, (prev) => {
      const { overflow, ...rest } = prev;
      type localType = Omit<IMenuListProps, 'overflow'>;
      const migratedStyles = migratePrevStyles(rest as localType, defaultStyles());
      return {
        ...prev,
        overflow: 'dropdown',
        ...migratedStyles,
      };
    }),
};

export default MenuListComponent;
