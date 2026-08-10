import React, { ReactNode } from 'react';
import { IHasVersion, Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';

export interface IComponentStateProps<TSettings = unknown> {
  isSelected: boolean;
  isEditMode: boolean;
  wrapperClassName: string;
  settings: TSettings;
}

export interface IOverlayProps {
  children?: React.ReactElement;
}

export type ConfigurableComponentChildrenFn<TSettings = unknown> = (
  componentState: IComponentStateProps<TSettings>,
  BlockOverlay: (props: IOverlayProps) => React.ReactElement,
) => React.ReactNode | null;

export interface ISettingsEditorProps<TSettings = unknown> {
  settings: TSettings | undefined;
  onSave: (settings: TSettings) => void;
  onCancel: () => void;
};

export interface ISettingsEditor<TSettings = unknown> {
  render: (props: ISettingsEditorProps<TSettings>) => ReactNode;
  save?: () => Promise<TSettings>;
}

export type ComponentSettingsMigrationContext = object;

/**
 * Settings migrator
 */
export type ComponentSettingsMigrator<TSettings extends IHasVersion = IHasVersion> = (
  migrator: Migrator<IHasVersion, TSettings, ComponentSettingsMigrationContext>,
) => MigratorFluent<TSettings, TSettings, ComponentSettingsMigrationContext>;

export interface IConfigurableApplicationComponentProps<TSettings extends IHasVersion = IHasVersion> {
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
