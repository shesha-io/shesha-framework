import { Migrator, MigratorFluent } from "@/utils/fluentMigrator/migrator";
import { DEFAULT_FORM_SETTINGS, FALLBACK_FORM_LAYOUT, IFormDto, IFormSettings } from "../models";
import { ColProps } from "antd";
import { migrateFormApi } from "@/designer-components/_common-migrations/migrateFormApi1";
import { migrateDefaults, migrateFormLifecycle } from "@/designer-components/_common-migrations/migrateFormLifecycle";
import { migrateDefaultApiEndpoints } from "@/designer-components/_common-migrations/migrateDefaultApiEndpoints";
import { migrateFieldsToFetchAndOnDataLoad } from "@/designer-components/_common-migrations/migrateFieldsToFetchAndOnDataLoad";
import { migrateGqlCustomEndpoint } from "@/designer-components/_common-migrations/migrateGqlCustomEndpoint";
import { IToolboxComponents } from "@/interfaces";
import { IFormMigrationContext } from "@/designer-components/_common-migrations/models";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getStringPropertyOrUndefined } from "@/utils/object";
import { migrateEmptyStaticLoaderEndpoint } from "@/designer-components/_common-migrations/migrateEmptyStaticLoaderEndpoint";


/** The column without a span equal to the old default, keeping its other settings (offset, etc.); undefined when nothing is left. */
const withoutDefaultSpan = (col: ColProps | undefined, defaultSpan: ColProps['span']): ColProps | undefined => {
  if (!isDefined(col) || col.span !== defaultSpan) return col;
  const { span: _span, ...rest } = col;
  return Object.keys(rest).length > 0 ? rest : undefined;
};

/**
 * Forms used to be saved with the framework's layout defaults (horizontal, 6/18 spans, colon) filled in -
 * by DEFAULT_FORM_SETTINGS and by migration 8 - so every form looked like it overrode the theme. Clear,
 * field by field, the values that still equal those defaults so the form follows the theme's Form Span
 * settings, whose own defaults are the same values. Any other value is a real override and is kept, and
 * since this runs once, a value saved afterwards (even one equal to a default) stays an override.
 */
const migrateLayoutToThemeDefaults = (prev: IFormSettings): IFormSettings => {
  const { layout, colon, labelCol, wrapperCol, ...rest } = prev;
  const ownLabelCol = withoutDefaultSpan(labelCol, FALLBACK_FORM_LAYOUT.labelCol.span);
  const ownWrapperCol = withoutDefaultSpan(wrapperCol, FALLBACK_FORM_LAYOUT.wrapperCol.span);
  // The layout follows the theme only when layout and both spans are the built-in defaults: a form with
  // its own spans chose its horizontal layout, so it keeps it.
  const isBuiltInDefaultLayout = layout === FALLBACK_FORM_LAYOUT.layout &&
    labelCol?.span === FALLBACK_FORM_LAYOUT.labelCol.span &&
    wrapperCol?.span === FALLBACK_FORM_LAYOUT.wrapperCol.span;
  return {
    ...rest,
    ...(isDefined(layout) && !isBuiltInDefaultLayout ? { layout } : {}),
    ...(isDefined(colon) && colon !== FALLBACK_FORM_LAYOUT.colon ? { colon } : {}),
    ...(isDefined(ownLabelCol) ? { labelCol: ownLabelCol } : {}),
    ...(isDefined(ownWrapperCol) ? { wrapperCol: ownWrapperCol } : {}),
  };
};

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
    .add(9, (prev) => migrateEmptyStaticLoaderEndpoint(prev))
    .add(10, (prev) => prev) // There was a wrong migration, leave version to save the version queue
    .add(11, (prev) => migrateLayoutToThemeDefaults(prev))
  ;

export const migrateFormSettings = (form: IFormDto, designerComponents: IToolboxComponents): Omit<IFormDto, 'settings'> & { settings: IFormSettings } => {
  const migrator = new Migrator<IFormSettings, IFormSettings, IFormMigrationContext>();
  const fluent = formSettingsMigrations(migrator);

  const version = form.settings?.version ?? -1;
  const settings = { ...(form.settings ?? DEFAULT_FORM_SETTINGS), version: version } satisfies IFormSettings;

  const upToDateSettings = fluent.migrator.upgrade(settings, { form, designerComponents });
  return { ...form, settings: upToDateSettings };
};
