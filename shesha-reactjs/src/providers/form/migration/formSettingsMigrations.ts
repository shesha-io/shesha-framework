import { Migrator } from "@/utils/fluentMigrator/migrator";
import { IFormDto, IFormSettings } from "../models";
import { migrateFormApi } from "@/designer-components/_common-migrations/migrateFormApi1";
import { migrateDefaults, migrateFormLifecycle } from "@/designer-components/_common-migrations/migrateFormLifecycle";
import { migrateDefaultApiEndpoints } from "@/designer-components/_common-migrations/migrateDefaultApiEndpoints";
import { migrateFieldsToFetchAndOnDataLoad } from "@/designer-components/_common-migrations/migrateFieldsToFetchAndOnDataLoad";
import { migrateGqlCustomEndpoint } from "@/designer-components/_common-migrations/migrateGqlCustomEndpoint";
import { IToolboxComponents } from "@/index";
import { IFormMigrationContext } from "@/designer-components/_common-migrations/models";


const formSettingsMigrations = (migrator: Migrator<IFormSettings, IFormSettings, IFormMigrationContext>) =>
  migrator
    .add(1, (prev) => ({
      ...prev,
      onDataLoaded: migrateFormApi.withoutFormData(prev.onUpdate),
      onInitialized: migrateFormApi.withoutFormData(prev.onInitialized),
      onUpdate: migrateFormApi.withoutFormData(prev.onUpdate),
    }))
    .add(2, (prev) => migrateFormLifecycle(prev))
    .add(3, (prev) => ({ ...prev, onValuesUpdate: prev.onValuesUpdate ?? prev['onValuesChanged'] }))
    .add(4, (prev) => migrateDefaultApiEndpoints(prev))
    .add(5, (prev) => migrateFieldsToFetchAndOnDataLoad(prev))
    .add(6, (prev) => migrateGqlCustomEndpoint(prev))
    .add(7, (prev, context) => migrateDefaults(prev, context))
  ;

export const migrateFormSettings = (form: IFormDto, designerComponents: IToolboxComponents) => {
  if (!form) return form;
  const migrator = new Migrator<IFormSettings, IFormSettings, IFormMigrationContext>();
  const fluent = formSettingsMigrations(migrator);
  if (!form.settings?.version) {
    if (!form.settings)
      form.settings = {} as IFormSettings;
    form.settings.version = -1;
  }
  const settings = fluent.migrator.upgrade(form.settings, { form, designerComponents } as IFormMigrationContext);
  return { ...form, settings };
};