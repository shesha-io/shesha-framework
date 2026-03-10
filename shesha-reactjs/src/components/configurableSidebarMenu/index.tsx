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

export const ConfigurableSidebarMenu: FC<IConfigurableSidebarMenuProps> = (props) => {
  const { loadedMenu, changeMainMenu, saveMainMenu } = useMainMenu();

  const editor = (editorProps: ISettingsEditorProps<ISideBarMenuProps>): JSX.Element => {
    return (
      <ComponentSettingsModal
        title="Sidebar Menu Configuration"
        settings={editorProps.settings ?? EmptySidebarProps}
        onSave={editorProps.onSave}
        onCancel={editorProps.onCancel}
      />
    );
  };

  const context: IConfigurableComponentContext<ISideBarMenuProps> = {
    settings: loadedMenu,
    load: () => { /**/ },
    save: (settings: ISideBarMenuProps) => {
      return saveMainMenu({ ...loadedMenu, ...settings })
        .then(() => {
          changeMainMenu({ ...loadedMenu, ...settings });
        });
    },
    setIsInProgressFlag: () => { /**/ },
    setSucceededFlag: () => { /**/ },
    setFailedFlag: () => { /**/ },
    setActionedFlag: () => { /**/ },
    resetIsInProgressFlag: () => { /**/ },
    resetSucceededFlag: () => { /**/ },
    resetFailedFlag: () => { /**/ },
    resetActionedFlag: () => { /**/ },
    resetAllFlag: () => { /**/ },
  };

  return (
    <ConfigurableComponentRenderer
      canConfigure={true}
      contextAccessor={() => context}
      settingsEditor={{ render: editor }}
    >
      {(componentState, BlockOverlay) => {
        return (
          <div className={`sidebar ${componentState.wrapperClassName}`} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, width: '10px', height: '100px', overflowY: 'hidden' }}>
              <BlockOverlay>
                <EditOutlined style={{ color: "#FFFFFF" }} />
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
