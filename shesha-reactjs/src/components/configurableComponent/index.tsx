import { ReactNode } from 'react';
import { IHasVersion, Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';

export interface ISettingsEditorProps<TSettings = unknown> {
  settings: TSettings | undefined;
  onSave: (settings: TSettings) => void;
  onCancel: () => void;
}

export interface ISettingsEditor<TSettings = unknown> {
  render: (props: ISettingsEditorProps<TSettings>) => ReactNode;
  save?: () => Promise<TSettings>;
}

type ComponentSettingsMigrationContext = object;

/**
 * Settings migrator
 */
export type ComponentSettingsMigrator<TSettings extends IHasVersion = IHasVersion> = (
  migrator: Migrator<IHasVersion, TSettings, ComponentSettingsMigrationContext>,
) => MigratorFluent<TSettings, TSettings, ComponentSettingsMigrationContext>;
