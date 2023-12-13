import React, { FC, useMemo } from 'react';
import { ConfigurableApplicationComponent, ISettingsEditorProps } from '@/components/configurableComponent';
import { SidebarMenu } from '@/components/sidebarMenu';
import { ISidebarMenuItem, SidebarMenuProvider } from '@/providers/sidebarMenu';
import ComponentSettingsModal from './settingsModal';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import CustomErrorBoundary from '@/components/customErrorBoundary';
import { migrateToConfigActions } from './migrations/migrateToConfigActions';

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
      <ConfigurableApplicationComponent<ISideBarMenuProps>
        defaultSettings={memoizedDefaults}
        settingsEditor={{
          render: editor,
        }}
        name={props.name}
        isApplicationSpecific={props.isApplicationSpecific}
        migrator={m => m.add(1, prev => migrateToConfigActions(prev))}
      >
        {(componentState, BlockOverlay) => (
          <div className={`sidebar ${componentState.wrapperClassName}`}>
            <BlockOverlay />

            <SidebarMenuProvider items={componentState.settings?.items || []}>
              <SidebarMenu theme={props.theme} />
            </SidebarMenuProvider>
          </div>
        )}
      </ConfigurableApplicationComponent>
    </CustomErrorBoundary>
  );
};

export default ConfigurableSidebarMenu;
