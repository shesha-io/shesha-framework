import { EllipsisOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EntityPicker } from '@/components/entityPicker';
import { ValidationErrors } from '@/components/validationErrors';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IEntityReferenceDto, IStoredFilter } from '@/interfaces';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useMetadataDispatcher } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { executeExpression } from '@/providers/form/utils';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { IEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { EntityPickerRef, IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getBooleanPropertyOrUndefined, getStringPropertyOrUndefined, pickProps } from '@/utils/object';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { EntityPickerComponentDefinition, IEntityPickerComponentProps } from './interfaces';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { migrateButtonGroupDynamicItems } from '../_common-migrations/migrateButtonGroupDynamicItems';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { isEntityReferenceId } from '@/utils';
import { getIdOrUndefined } from '@/utils/entity';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents, StandardEventHandlerWithoutChange } from '../_common/events';

/**
 * The picker has no free-text input: the Select renders with `open={false}` and no `showSearch`,
 * and all selection happens in the modal. Keyboard events can therefore never fire on it, so
 * `onKeyDown`/`onKeyUp` are dropped rather than offered as settings that would never run.
 */
const ENTITY_PICKER_RUNTIME_EVENTS: readonly StandardEventHandlerWithoutChange[] =
  ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK.filter(
    (event): event is StandardEventHandlerWithoutChange => event !== 'onKeyDown' && event !== 'onKeyUp',
  );
import { EntityPickerApi } from '../../componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";

type EntityPickerValueType = string | string[] | IEntityReferenceDto | IEntityReferenceDto[];

/**
 * Resolves a configured dialog width. The settings form stores the width directly, but older
 * configurations stored the literal `'custom'` alongside a separate numeric width and unit.
 */
const resolveDialogWidth = (
  modalWidth: IEntityPickerComponentProps['modalWidth'],
  customWidth: number | undefined,
  widthUnits: string | undefined,
): number | string | undefined => modalWidth === 'custom' && isDefined(customWidth)
  ? `${customWidth}${widthUnits}`
  : modalWidth;

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

    const componentApi = useComponentApiProvider();
    const pickerRef = useRef<EntityPickerRef>(null);
    useEffect(() => {
      componentApi?.updateApi<EntityPickerApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'EntityPickerApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        // `selectedItems` is a read-only property rather than a method, so it is registered here
        // and resolved on read — the declared API member was previously always `undefined`.
        properties: [
          { name: 'selectedItems', getter: () => pickerRef.current?.getSelectedItems() ?? [] },
        ],
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

    const { filters } = model;

    const displayEntityKey = isNotNullOrWhiteSpace(model.displayEntityKey) ? model.displayEntityKey : '_displayName';

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

    if (model.background?.type === 'storedFile' && isNotNullOrWhiteSpace(model.background.storedFile?.id) && !isValidGuid(model.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    // The picker dialog and the "add new record" dialog are sized independently. Both still honour
    // the legacy `custom` width + units pair, which older configurations may carry.
    const width = resolveDialogWidth(model.modalWidth, model.customWidth, model.widthUnits);
    const addNewWidth = resolveDialogWidth(model.addNewModalWidth, model.addNewCustomWidth, model.addNewWidthUnits);

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
              addNewRecordsProps={model.allowNewRecord === true
                ? {
                  modalFormId: model.modalFormId,
                  modalTitle: model.modalTitle,
                  showModalFooter: model.showModalFooter,
                  modalWidth: addNewWidth,
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
                model, ENTITY_PICKER_RUNTIME_EVENTS, ctx, value, DataTypes.entityReference,
              )}
              size={model.size}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  actualModelPropertyFilter: (name) => name !== 'filters',
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
      valueFormat: prev.valueFormat ?? (context.isNew === true
        ? 'simple'
        : getBooleanPropertyOrUndefined(prev, "useRawValues") === true ||
          getBooleanPropertyOrUndefined(prev, "useRawValue") === true
          ? 'simple'
          : 'entityReference'),
    }))
    .add<IEntityPickerComponentProps>(8, (prev, context) => ({
      ...prev,
      footerButtons: context.isNew === true
        ? 'default'
        : prev.footerButtons ?? (prev.showModalFooter === true ? 'default' : 'none'),
    }))
    .add<IEntityPickerComponentProps>(9, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IEntityPickerComponentProps>(10, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles(prev)) })
    .add<IEntityPickerComponentProps>(11, (prev, context) => ({
      ...prev,
      entityType: context.isNew === true && !Boolean(prev.entityType) ? 'Shesha.Core.Person' : prev.entityType,
    }))
    .add<IEntityPickerComponentProps>(12, (prev) => ({ ...prev, buttons: migrateButtonGroupDynamicItems(prev.buttons) }))
    .add<IEntityPickerComponentProps>(13, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = pickProps(prev, ['size', 'hideBorder', 'stylingBox', 'style']);

      return { ...prev, desktop: { ...prev.desktop, ...styles }, tablet: { ...prev.tablet, ...styles }, mobile: { ...prev.mobile, ...styles } };
    })
    .add<IEntityPickerComponentProps>(14, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev))))
    // `modalWidth` used to size both the picker dialog and the "add new record" dialog. Now that
    // they are configured separately, seed the new record dialog from the old shared value so
    // existing configurations keep rendering both dialogs at the width they do today.
    .add<IEntityPickerComponentProps>(15, (prev, context) => {
      if (context.isNew === true) return prev;
      if (!isDefined(prev.modalWidth)) return prev;

      return {
        ...prev,
        addNewModalWidth: prev.addNewModalWidth ?? prev.modalWidth,
        addNewCustomWidth: prev.addNewCustomWidth ?? prev.customWidth,
        addNewWidthUnits: prev.addNewWidthUnits ?? prev.widthUnits,
      };
    }),
  settingsFormMarkup: getSettings,

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
        isNotNullOrWhiteSpace(rawModel.displayEntityKey)
          ? `${propertyName}.${rawModel.displayEntityKey}`
          : `${propertyName}._displayName`,
        `${propertyName}._className`,
      ];
    }
    return [];
  },
  validateModel: (model, addModelError) => {
    if (!isDefined(model.entityType)) addModelError('entityType', 'Select `Entity Type` on the settings panel');
  },
};

export default EntityPickerComponent;
