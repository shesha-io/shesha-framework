import React, { FC } from 'react';
import { ISettingsEditorProps } from '@/components/configurableComponent';
import { SidebarMenu } from '@/components/sidebarMenu';
import { ISidebarMenuItem } from '@/providers/sidebarMenu';
import { ComponentSettingsModal } from './settingsModal';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';
import { Button } from 'antd';
import ConfigurableComponentRenderer from '../configurableComponentRenderer';
import { IConfigurableComponentContext } from '@/providers/configurableComponent/contexts';
import { useMainMenu } from '@/providers/mainMenu';

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
            <div className={`sidebar ${componentState.wrapperClassName}`}>
              <BlockOverlay>
                <div className='sha-configurable-sidemenu-button-wrapper'>
                  <Button title='Edit sidebar menu' shape='default' icon={<RebaseEditOutlined />} />
                </div>
              </BlockOverlay>
              <SidebarMenu theme={props.theme} />
            </div>
          );
        }}
    </ConfigurableComponentRenderer>
  );
};

export default ConfigurableSidebarMenu;
