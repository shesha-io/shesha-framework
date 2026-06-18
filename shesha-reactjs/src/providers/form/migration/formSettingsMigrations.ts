import { Migrator, MigratorFluent } from "@/utils/fluentMigrator/migrator";
import { DEFAULT_FORM_SETTINGS, IFormDto, IFormSettings } from "../models";
import { migrateFormApi } from "@/designer-components/_common-migrations/migrateFormApi1";
import { migrateDefaults, migrateFormLifecycle } from "@/designer-components/_common-migrations/migrateFormLifecycle";
import { migrateDefaultApiEndpoints } from "@/designer-components/_common-migrations/migrateDefaultApiEndpoints";
import { migrateFieldsToFetchAndOnDataLoad } from "@/designer-components/_common-migrations/migrateFieldsToFetchAndOnDataLoad";
import { migrateGqlCustomEndpoint } from "@/designer-components/_common-migrations/migrateGqlCustomEndpoint";
import { IToolboxComponents } from "@/interfaces";
import { IFormMigrationContext } from "@/designer-components/_common-migrations/models";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getStringPropertyOrUndefined } from "@/utils/object";


const formSettingsMigrations = (migrator: Migrator<IFormSettings, IFormSettings, IFormMigrationContext>): MigratorFluent<IFormSettings, IFormSettings, IFormMigrationContext> =>
  migrator
    .add(1, (prev) => ({
      ...prev,
      onDataLoaded: migrateFormApi.withoutFormData(prev.onUpdate),
      onInitialized: migrateFormApi.withoutFormData(prev.onInitialized),
      onUpdate: migrateFormApi.withoutFormData(prev.onUpdate),
    }))
    .add(2, (prev) => migrateFormLifecycle(prev))
    .add(3, (prev) => ({ ...prev, onValuesUpdate: !isNullOrWhiteSpace(prev.onValuesUpdate) ? prev.onValuesUpdate : getStringPropertyOrUndefined(prev, "onValuesChanged") }))
    .add(4, (prev) => migrateDefaultApiEndpoints(prev))
    .add(5, (prev) => migrateFieldsToFetchAndOnDataLoad(prev))
    .add(6, (prev) => migrateGqlCustomEndpoint(prev))
    .add(7, (prev, context) => migrateDefaults(prev, context))
    .add(8, (prev) => ({
      ...prev,
      layout: isDefined(prev.layout) ? prev.layout : 'horizontal',
      labelCol: isDefined(prev.labelCol) ? prev.labelCol : { span: 6 },
      wrapperCol: isDefined(prev.wrapperCol) ? prev.wrapperCol : { span: 18 },
    }))
  ;

export const migrateFormSettings = (form: IFormDto, designerComponents: IToolboxComponents): Omit<IFormDto, 'settings'> & { settings: IFormSettings } => {
  const migrator = new Migrator<IFormSettings, IFormSettings, IFormMigrationContext>();
  const fluent = formSettingsMigrations(migrator);

  const version = form.settings?.version ?? -1;
  const settings = { ...DEFAULT_FORM_SETTINGS, ...form.settings, version: version } satisfies IFormSettings;

  const upToDateSettings = fluent.migrator.upgrade(settings, { form, designerComponents });
  return { ...form, settings: upToDateSettings };
};
