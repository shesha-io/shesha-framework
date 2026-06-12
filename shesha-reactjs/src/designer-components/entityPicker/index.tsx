import { EllipsisOutlined } from '@ant-design/icons';
import React, { CSSProperties, useCallback, useMemo } from 'react';
import { EntityPicker } from '@/components/entityPicker';
import { ValidationErrors } from '@/components/validationErrors';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { FilterExpression, IEntityReferenceDto, IStoredFilter, IToolboxComponent } from '@/interfaces';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { ButtonGroupItemProps, IStyleType, useMetadataDispatcher } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { FormIdentifier, IConfigurableFormComponent } from '@/providers/form/models';
import { executeExpression, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { IEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getBooleanPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { migrateButtonGroupDynamicItems } from '../_common-migrations/migrateButtonGroupDynamicItems';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isEntityReferenceId } from '@/utils';
import { getIdOrUndefined } from '@/utils/entity';

export interface IEntityPickerComponentProps extends IConfigurableFormComponent, IStyleType {
  placeholder?: string | undefined;
  items: IConfigurableColumnsProps[];
  hideBorder?: boolean | undefined;
  valueFormat?: 'simple' | 'entityReference' | 'custom' | undefined;
  incomeCustomJs?: string | undefined;
  outcomeCustomJs?: string | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  entityType: string | IEntityTypeIdentifier;
  filters?: FilterExpression | undefined;
  title?: string | undefined;
  displayEntityKey?: string | undefined;
  allowNewRecord?: boolean | undefined;
  modalFormId?: FormIdentifier | undefined;
  modalTitle?: string | undefined;
  showModalFooter?: boolean | undefined;
  modalWidth?: number | string | 'custom' | undefined;
  customWidth?: number | undefined;
  widthUnits?: string | undefined;
  buttons?: ButtonGroupItemProps[] | undefined;
  footerButtons?: ModalFooterButtons | undefined;
  dividerWidth?: string | undefined;
  dividerStyle?: CSSProperties['borderLeftStyle'] | undefined;
  dividerColor?: string | undefined;
}

type EntityPickerValueType = string | string[] | IEntityReferenceDto | IEntityReferenceDto[];

const EntityPickerComponent: IToolboxComponent<IEntityPickerComponentProps> = {
  type: 'entityPicker',
  isInput: true,
  isOutput: true,
  name: 'Entity Picker',
  icon: <EllipsisOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.entityReference ||
    (dataType === DataTypes.array && !isNullOrWhiteSpace(dataFormat) && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(dataFormat)),
  Factory: ({ model }) => {
    const { getMetadata } = useMetadataDispatcher();

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
        return isDefined(value) && isEntityReferenceId(value)
          ? value.id
          : null;
      }
      if (model.valueFormat === 'custom') {
        if (isNullOrWhiteSpace(model.incomeCustomJs))
          throw new Error('Custom income expression is empty');
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
        return isDefined(value) && isEntityReferenceId(value) && !isNullOrWhiteSpace(value.id)
          ? { id: value.id, _displayName: getStringPropertyOrUndefined(value, displayEntityKey) ?? "", _className: value._className ?? metadata?.fullClassName ?? "" } satisfies IEntityReferenceDto
          : undefined;
      }
      if (model.valueFormat === 'custom') {
        if (isNullOrWhiteSpace(model.outcomeCustomJs))
          throw new Error('Custom outcome expression is empty');
        return executeExpression<string | IEntityReferenceDto | undefined>(model.outcomeCustomJs, { ...args, value }, undefined) ?? undefined;
      }
      return getIdOrUndefined(value);
    }, [model.valueFormat, model.outcomeCustomJs, displayEntityKey, metadata]);

    if (model.background?.type === 'storedFile' && model.background.storedFile?.id && !isValidGuid(model.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const width = modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth;

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles?.fontStyles,
      ...model.allStyles?.dimensionsStyles,
    } : model.allStyles?.fullStyle;

    return (
      <ConfigurableFormItem<EntityPickerValueType> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <EntityPicker
              incomeValueFunc={incomeValueFunc}
              outcomeValueFunc={outcomeValueFunc}
              placeholder={model.placeholder}
              style={{ ...finalStyle }}
              formId={model.id}
              readOnly={model.readOnly}
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
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                onChange(newValue);
              }}
              size={model.size}
              dividerStyle={model.border?.border?.middle}
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
        : prev.footerButtons ?? prev.showModalFooter ? 'default' : 'none',
    }))
    .add<IEntityPickerComponentProps>(9, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IEntityPickerComponentProps>(10, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) }))
    .add<IEntityPickerComponentProps>(11, (prev, context) => ({
      ...prev,
      // Default to Person for backward compatibility with legacy forms
      // should explicitly set entityType for other entity types
      entityType: context.isNew && !prev.entityType ? 'Shesha.Core.Person' : prev.entityType,
    }))
    .add<IEntityPickerComponentProps>(12, (prev) => ({ ...prev, buttons: migrateButtonGroupDynamicItems(prev.buttons) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),

  linkToModelMetadata: (model, propMetadata): IEntityPickerComponentProps => {
    return {
      ...model,
      mode: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'multiple' : 'single',
      entityType: isEntityReferencePropertyMetadata(propMetadata) && !isNullOrWhiteSpace(propMetadata.entityType)
        ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
        : isEntityReferenceArrayPropertyMetadata(propMetadata) && isDefined(propMetadata.itemsType) && !isNullOrWhiteSpace(propMetadata.itemsType.entityType)
          ? { name: propMetadata.itemsType.entityType, module: propMetadata.itemsType.entityModule ?? null }
          : "",
      valueFormat: isEntityReferencePropertyMetadata(propMetadata) || isEntityReferenceArrayPropertyMetadata(propMetadata)
        ? 'entityReference'
        : 'simple',
      filters: isHasFilter(propMetadata.formatting)
        ? { ...propMetadata.formatting.filter }
        : undefined,
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
