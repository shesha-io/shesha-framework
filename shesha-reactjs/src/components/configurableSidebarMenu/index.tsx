import React, { FC, useMemo } from 'react';
import { ConfigurableComponent, ISettingsEditorProps } from '../configurableComponent';
import { SidebarMenu } from '../sidebarMenu';
import { ISidebarMenuItem, SidebarMenuProvider } from '../../providers/sidebarMenu';
import ComponentSettingsModal from './settingsModal';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import CustomErrorBoundary from '../customErrorBoundary';

export interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
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
  
  const editor = (editorProps: ISettingsEditorProps<ISideBarMenuProps>) => {
    return (
      <ComponentSettingsModal
        settings={editorProps.settings ?? EmptySidebarProps}
        onSave={editorProps.onSave}
        onCancel={editorProps.onCancel}
      />
    );
  };
  const memoizedDefaults = useMemo(() => props.defaultSettings ?? { items: [] }, [props.defaultSettings]);

  return (
    <CustomErrorBoundary>
      <ConfigurableComponent<ISideBarMenuProps>
        defaultSettings={memoizedDefaults}
        settingsEditor={{
          render: editor,
        }}
        name={props.name}
        isApplicationSpecific={props.isApplicationSpecific}
      >
        {(componentState, BlockOverlay) => (
          <div className={`sidebar ${componentState.wrapperClassName}`}>
            <BlockOverlay />

            <SidebarMenuProvider items={componentState.settings?.items || []}>
              <SidebarMenu theme={props.theme} />
            </SidebarMenuProvider>
          </div>
        )}
      </ConfigurableComponent>
    </CustomErrorBoundary>
  );
};

export default ConfigurableSidebarMenu;
