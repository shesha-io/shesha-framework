import React, { ReactElement, ReactNode, useMemo } from 'react';
import { createConfigurableComponent } from '@/providers';
import { ConfigurableComponentRenderer } from '@/components/configurableComponentRenderer';
import { Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';

export interface IComponentStateProps<TSettings = any> {
  isSelected: boolean;
  isEditMode: boolean;
  wrapperClassName: string;
  settings: TSettings;
}

export interface IOverlayProps {
  children?: React.ReactElement;
}

export type ConfigurableComponentChildrenFn<TSettings = any> = (
  componentState: IComponentStateProps<TSettings>,
  BlockOverlay: (props: IOverlayProps) => React.ReactElement
) => React.ReactNode | null;

export interface ISettingsEditorProps<TSettings = any> {
  settings: TSettings;
  onSave: (settings: TSettings) => void;
  onCancel: () => void;
};

export interface ISettingsEditor<TSettings = any> {
  render: (props: ISettingsEditorProps<TSettings>) => ReactNode;
  save?: () => Promise<TSettings>;
}

export type ComponentSettingsMigrationContext = unknown;

/**
 * Settings migrator
 */
export type ComponentSettingsMigrator<TSettings> = (
  migrator: Migrator<any, TSettings, ComponentSettingsMigrationContext>
) => MigratorFluent<TSettings, TSettings, ComponentSettingsMigrationContext>;

export interface IConfigurableApplicationComponentProps<TSettings = any> {
  canConfigure?: boolean;
  children: ConfigurableComponentChildrenFn<TSettings>;
  onStartEdit?: () => void;
  defaultSettings: TSettings;
  settingsEditor?: ISettingsEditor<TSettings>;
  name: string;
  isApplicationSpecific: boolean;
  /**
   * Settings migrations. Returns last version of settings
   */
  migrator?: ComponentSettingsMigrator<TSettings>;
}

export interface IBlockOverlayProps {
  visible: boolean;
  onClick?: () => void;
}

export const ConfigurableApplicationComponent = <TSettings extends object>({
  children,
  canConfigure = true,
  defaultSettings,
  settingsEditor,
  name,
  isApplicationSpecific,
  migrator,
}: IConfigurableApplicationComponentProps<TSettings>): ReactElement => {
  const component = useMemo(() => {
    return createConfigurableComponent<TSettings>(defaultSettings, migrator);
  }, [defaultSettings]);
  const { ConfigurableComponentProvider, useConfigurableComponent } = component;

  return (
    <ConfigurableComponentProvider
      name={name}
      isApplicationSpecific={isApplicationSpecific}
    >
      <ConfigurableComponentRenderer
        canConfigure={canConfigure}
        contextAccessor={useConfigurableComponent}
        settingsEditor={settingsEditor}
      >
        {children}
      </ConfigurableComponentRenderer>
    </ConfigurableComponentProvider>
  );
};
