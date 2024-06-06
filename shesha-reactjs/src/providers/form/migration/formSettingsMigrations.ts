import { Migrator } from "@/utils/fluentMigrator/migrator";
import { IFormDto, IFormSettings } from "../models";
import { migrateFormApi } from "@/designer-components/_common-migrations/migrateFormApi1";

const formSettingsMigrations = (migrator: Migrator<IFormSettings, IFormSettings>) => 
  migrator
    .add(1, (prev) => ({
      ...prev,
      onDataLoaded: migrateFormApi.withoutFormData(prev.onUpdate),
      onInitialized: migrateFormApi.withoutFormData(prev.onInitialized),
      onUpdate: migrateFormApi.withoutFormData(prev.onUpdate),
    }))
;

export const migrateFormSettings = (form: IFormDto) => {
  if (!form) return form;
  const migrator = new Migrator<IFormSettings, IFormSettings>();
  const fluent = formSettingsMigrations(migrator);
  if (form.settings.version === undefined) form.settings.version = -1;
  return {...form, settings: fluent.migrator.upgrade(form.settings, {})};
};