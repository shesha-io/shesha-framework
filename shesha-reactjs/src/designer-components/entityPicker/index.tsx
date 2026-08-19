import { EllipsisOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EntityPicker } from '@/components/entityPicker';
import { ValidationErrors } from '@/components/validationErrors';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IEntityReferenceDto, IStoredFilter } from '@/interfaces';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useMetadataDispatcher } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { executeExpression, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { IEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { EntityPickerRef, IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getBooleanPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { EntityPickerComponentDefinition, IEntityPickerComponentProps } from './interfaces';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { migrateButtonGroupDynamicItems } from '../_common-migrations/migrateButtonGroupDynamicItems';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isEntityReferenceId } from '@/utils';
import { getIdOrUndefined } from '@/utils/entity';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';
import { EntityPickerApi } from '../../componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";

type EntityPickerValueType = string | string[] | IEntityReferenceDto | IEntityReferenceDto[];

export type { IEntityPickerComponentProps };

const EntityPickerComponent: EntityPickerComponentDefinition = {
  allowInherit: true,
  type: 'entityPicker',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Entity Picker',
  icon: <EllipsisOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.entityReference ||
    (dataType === DataTypes.array && !isNullOrWhiteSpace(dataFormat) && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(dataFormat)),
  Factory: ({ model }) => {
    const { getMetadata } = useMetadataDispatcher();

    const componentApi = useComponentApi();
    const pickerRef = useRef<EntityPickerRef>(null);
    useEffect(() => {
      componentApi?.updateApi<EntityPickerApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'EntityPickerApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [],
        api: {
          focus: () => pickerRef.current?.focus(),
          showPicker: () => pickerRef.current?.showPicker(),
          hidePicker: () => pickerRef.current?.hidePicker(),
        },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    const metadata = useAsyncMemo(async () => {
      return await getMetadata({ dataType: DataTypes.entityReference, modelType: model.entityType }) as IEntityMetadata;
    }, [model.entityType]);

    const { filters, modalWidth, customWidth, widthUnits } = model;

    const displayEntityKey = model.displayEntityKey || '_displayName';

    const entityPickerFilter = useMemo<IStoredFilter[]>(() => {
      return [
        {
          defaultSelected: true,
          expression: filters,
          id: 'uZ4sjEhzO7joxO6kUvwdb',
          name: 'entity Picker',
          selected: true,
          sortOrder: 0,
        },
      ];
    }, [filters]);

    const incomeValueFunc: IncomeValueFunc = useCallback((value, args) => {
      if (model.valueFormat === 'entityReference') {
        // Accept plain string id (e.g. after switching from simple format) or entity reference object
        if (typeof value === 'string') return value || null;
        return isDefined(value) && isEntityReferenceId(value)
          ? value.id
          : null;
      }
      if (model.valueFormat === 'custom') {
        if (isNullOrWhiteSpace(model.incomeCustomJs))
          return null;
        return executeExpression<string | null>(model.incomeCustomJs, { ...args, value }, null);
      }
      return typeof (value) === 'string'
        ? value
        : isEntityReferenceId(value)
          ? value.id
          : null;
    }, [model.valueFormat, model.incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value, args) => {
      if (model.valueFormat === 'entityReference') {
        // Accept any object with a non-empty string id (e.g. ITableRowData from picker modal or existing IEntityReferenceDto)
        if (!isDefined(value) || typeof value !== 'object' || !('id' in value)) return undefined;

        const valueObj = value as Record<string, unknown>;
        const id = getStringPropertyOrUndefined(valueObj, 'id');
        if (isNullOrWhiteSpace(id)) return undefined;

        // Preserve existing _displayName if present, otherwise try displayEntityKey, then fall back to empty string
        const existingDisplayName = getStringPropertyOrUndefined(valueObj, '_displayName');
        const displayName = existingDisplayName ?? getStringPropertyOrUndefined(valueObj, displayEntityKey) ?? "";
        const className = getStringPropertyOrUndefined(valueObj, '_className') ?? metadata?.fullClassName ?? "";

        return { id, _displayName: displayName, _className: className } satisfies IEntityReferenceDto;
      }
      if (model.valueFormat === 'custom') {
        if (isNullOrWhiteSpace(model.outcomeCustomJs))
          return undefined;
        return executeExpression<string | IEntityReferenceDto | undefined>(model.outcomeCustomJs, { ...args, value }, undefined) ?? undefined;
      }
      return getIdOrUndefined(value);
    }, [model.valueFormat, model.outcomeCustomJs, displayEntityKey, metadata]);

    if (model.background?.type === 'storedFile' && model.background.storedFile?.id && !isValidGuid(model.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const width = modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth;

    return (
      <ConfigurableFormItem<EntityPickerValueType> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <EntityPicker
              incomeValueFunc={incomeValueFunc}
              outcomeValueFunc={outcomeValueFunc}
              placeholder={model.placeholder}
              readOnlyPlaceholder={model.readOnlyPlaceholder}
              className={styles.entityPicker}
              // Custom style is passed through as-is; everything else is emitted as CSS by `useStyles`
              // so unset properties keep cascading from the theme.
              {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
              // Read-only rendering happens outside the picker wrapper, where the emotion class does
              // not reach, so the style model is handed over as a value for that path.
              styleValue={model}
              enableFullStyle={model.enableStyleOnReadonly}
              formId={model.id}
              readOnly={model.readOnly === true}
              disabled={model.disabled === true}
              displayEntityKey={displayEntityKey}
              entityType={model.entityType}
              filters={entityPickerFilter}
              mode={model.mode}
              hideBorder={model.hideBorder}
              addNewRecordsProps={model.allowNewRecord
                ? {
                  modalFormId: model.modalFormId,
                  modalTitle: model.modalTitle,
                  showModalFooter: model.showModalFooter,
                  modalWidth: customWidth ? `${customWidth}${widthUnits}` : modalWidth,
                  buttons: model.buttons,
                  footerButtons: model.footerButtons,
                }
                : undefined}
              name={model.componentName}
              width={width}
              configurableColumns={model.items}
              value={value ?? undefined}
              pickerRef={pickerRef}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue);
              }}
              events={getComponentEvents<EntityPickerValueType>(
                model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.entityReference,
              )}
              size={model.size}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<IEntityPickerComponentProps>(0, (prev) => {
      return {
        ...prev,
        items: 'items' in prev && Array.isArray(prev.items) ? prev.items as IConfigurableColumnsProps[] : [],
        mode: "mode" in prev && typeof (prev.mode) === "string" && ['single', 'multiple', 'tags'].includes(prev.mode)
          ? prev.mode as IEntityPickerComponentProps['mode']
          : 'single',
        entityType: "entityType" in prev && typeof (prev.entityType) === "string" ? prev.entityType : "",
      };
    })
    .add<IEntityPickerComponentProps>(1, migrateV0toV1)
    .add<IEntityPickerComponentProps>(2, (prev) => {
      return { ...prev, useRawValues: true };
    })
    .add<IEntityPickerComponentProps>(3, (prev) => {
      const result = { ...prev };
      if ("useExpression" in result) {
        const useExpression = Boolean(result.useExpression);
        delete result['useExpression'];

        if (useExpression && "filters" in result && (typeof result.filters === "string" || typeof result.filters === "object")) {
          const migratedExpression = migrateDynamicExpression(result.filters);
          result.filters = migratedExpression;
        }
      }

      return result;
    })
    .add<IEntityPickerComponentProps>(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEntityPickerComponentProps>(5, (prev) => migrateVisibility(prev))
    .add<IEntityPickerComponentProps>(6, (prev) => migrateReadOnly(prev))
    .add<IEntityPickerComponentProps>(7, (prev, context) => ({
      ...prev,
      valueFormat: prev.valueFormat ??
        context.isNew
        ? 'simple'
        : getBooleanPropertyOrUndefined(prev, "useRawValue") === true
          ? 'simple'
          : 'entityReference',
    }))
    .add<IEntityPickerComponentProps>(8, (prev, context) => ({
      ...prev,
      footerButtons: context.isNew
        ? 'default'
        : prev.footerButtons ?? (prev.showModalFooter ? 'default' : 'none'),
    }))
    .add<IEntityPickerComponentProps>(9, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    // A newly dropped component ships empty and inherits from the entity model, so the style
    // back-fill below only exists to freeze how forms saved before these settings existed look.
    .add<IEntityPickerComponentProps>(10, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles(prev)) })
    .add<IEntityPickerComponentProps>(11, (prev, context) => ({
      ...prev,
      // Default to Person for backward compatibility with legacy forms
      // should explicitly set entityType for other entity types
      entityType: context.isNew && !prev.entityType ? 'Shesha.Core.Person' : prev.entityType,
    }))
    .add<IEntityPickerComponentProps>(12, (prev) => ({ ...prev, buttons: migrateButtonGroupDynamicItems(prev.buttons) }))
    .add<IEntityPickerComponentProps>(13, (prev, context) => {
      if (context.isNew === true) return prev;

      // Carries the pre-Appearance-tab flat settings into the persisted device models, so an old
      // form keeps its look rather than following whatever the code-level defaults later become.
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
    })
    .add<IEntityPickerComponentProps>(14, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  previewConfiguration: {
    type: 'entityPicker',
    id: 'entityPicker',
    propertyName: 'entityPickerAppearance',
    label: 'Entity Picker Label',
    version: 'latest',
    items: [],
    mode: 'single',
    entityType: 'Shesha.Core.Person',
    valueFormat: 'entityReference',
  },
  /* Inheritance, not a defaults seeder: each property is filled only when the metadata actually
     describes it, so anything the user configured by hand survives.

     The entityType fallback matters. This used to resolve to `""` whenever the metadata guards did
     not match, which — because `getComponentModelFromMetadata` blanks the model before calling
     this — replaced a configured entity type with an empty string on every re-bind. The runtime
     then had no type to query and the picker threw. Leaving it `undefined` keeps the configured
     value instead. */
  linkToModelMetadata: (model, propMetadata): IEntityPickerComponentProps => {
    const isSingleRef = isEntityReferencePropertyMetadata(propMetadata);
    const isArrayRef = isEntityReferenceArrayPropertyMetadata(propMetadata);

    const entityTypeFromMetadata = isSingleRef && !isNullOrWhiteSpace(propMetadata.entityType)
      ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
      : isArrayRef && isDefined(propMetadata.itemsType) && !isNullOrWhiteSpace(propMetadata.itemsType.entityType)
        ? { name: propMetadata.itemsType.entityType, module: propMetadata.itemsType.entityModule ?? null }
        : undefined;

    return {
      ...model,
      ...(isSingleRef || isArrayRef ? { mode: isArrayRef ? 'multiple' : 'single' } : {}),
      ...(isDefined(entityTypeFromMetadata) ? { entityType: entityTypeFromMetadata } : {}),
      ...(isSingleRef || isArrayRef ? { valueFormat: 'entityReference' as const } : {}),
      ...(isHasFilter(propMetadata.formatting) ? { filters: { ...propMetadata.formatting.filter } } : {}),
    };
  },
  getFieldsToFetch: (propertyName, rawModel) => {
    if (rawModel.valueFormat === 'entityReference') {
      return [
        `${propertyName}.id`,
        rawModel.displayEntityKey
          ? `${propertyName}.${rawModel.displayEntityKey}`
          : `${propertyName}._displayName`,
        `${propertyName}._className`,
      ];
    }
    return [];
  },
  validateModel: (model, addModelError) => {
    if (!model.entityType) addModelError('entityType', 'Select `Entity Type` on the settings panel');
  },
};

export default EntityPickerComponent;
