import React, { FC } from 'react';
import { ISettingsEditorProps } from '@/components/configurableComponent';
import { SidebarMenu } from '@/components/sidebarMenu';
import { ComponentSettingsModal } from './settingsModal';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { EditOutlined } from '@ant-design/icons';
import ConfigurableComponentRenderer from '../configurableComponentRenderer';
import { IConfigurableComponentContext } from '@/providers/configurableComponent/contexts';
import { useMainMenu } from '@/providers/mainMenu';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
  version?: number;
}

const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

export interface IConfigurableSidebarMenuProps {
  theme?: MenuTheme;
  defaultSettings?: ISideBarMenuProps;
  name: string;
  isApplicationSpecific: boolean;
}

export const ConfigurableSidebarMenu: FC<IConfigurableSidebarMenuProps> = props => {
  
  const { loadedMenu, changeMainMenu, saveMainMenu } = useMainMenu();

  const editor = (editorProps: ISettingsEditorProps<ISideBarMenuProps>) => {
    return (
      <ComponentSettingsModal
        title='Sidebar Menu Configuration'
        settings={editorProps.settings ?? EmptySidebarProps}
        onSave={editorProps.onSave}
        onCancel={editorProps.onCancel}
      />
    );
  };

  const context: IConfigurableComponentContext<ISideBarMenuProps> = {
    settings: loadedMenu,
    load: () => {/**/},
    save: (settings: ISideBarMenuProps) => {
      return saveMainMenu({...loadedMenu, ...settings})
        .then(() => {
          changeMainMenu({...loadedMenu, ...settings});
        });
    },
    setIsInProgressFlag: () => {/**/},
    setSucceededFlag: () => {/**/},
    setFailedFlag: () => {/**/},
    setActionedFlag: () => {/**/},
    resetIsInProgressFlag: () => {/**/},
    resetSucceededFlag: () => {/**/},
    resetFailedFlag: () => {/**/},
    resetActionedFlag: () => {/**/},
    resetAllFlag: () => {/**/},
  };

  return (
    <ConfigurableComponentRenderer
      canConfigure={true}
      contextAccessor={() => context}
      settingsEditor={{render: editor}}
    >
      {(componentState, BlockOverlay) => {
          return (
            <div className={`sidebar ${componentState.wrapperClassName}`} style={{position: "relative", background: 'red', width: "100%"}}>
          
                <div style={{position: 'absolute', bottom: 0, width: '100px', height: '100px'}}>
                <BlockOverlay>
                <EditOutlined style={{color: "#FFFFFF"}}/>
                </BlockOverlay>
                </div>

              <SidebarMenu theme={props.theme} />
            </div>
          );
        }}
    </ConfigurableComponentRenderer>
  );
};

export default ConfigurableSidebarMenu;
