import { EllipsisOutlined } from '@ant-design/icons';
import React, { CSSProperties, useCallback, useMemo } from 'react';
import { EntityPicker, ValidationErrors } from '@/components';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ButtonGroupItemProps, IStyleType } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { FormIdentifier, IConfigurableFormComponent } from '@/providers/form/models';
import { executeExpression, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { customOnChangeValueEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getValueByPropertyName } from '@/utils/object';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

export interface IEntityPickerComponentProps extends IConfigurableFormComponent, IStyleType {
  placeholder?: string;
  items: IConfigurableColumnsProps[];
  hideBorder?: boolean;
  valueFormat?: 'simple' | 'entityReference' | 'custom';
  incomeCustomJs?: string;
  outcomeCustomJs?: string;
  mode?: 'single' | 'multiple' | 'tags';
  entityType: string;
  filters?: object;
  title?: string;
  displayEntityKey?: string;
  allowNewRecord?: boolean;
  modalFormId?: FormIdentifier;
  modalTitle?: string;
  showModalFooter?: boolean;
  modalWidth?: number | string | 'custom';
  customWidth?: number;
  widthUnits?: string;
  buttons?: ButtonGroupItemProps[];
  footerButtons?: ModalFooterButtons;
  dividerWidth?: string;
  dividerStyle?: CSSProperties['borderLeftStyle'];
  dividerColor?: string;
}

const EntityPickerComponent: IToolboxComponent<IEntityPickerComponentProps> = {
  type: 'entityPicker',
  isInput: true,
  isOutput: true,
  name: 'Entity Picker',
  icon: <EllipsisOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    const { filters, modalWidth, customWidth, widthUnits } = model;

    const displayEntityKey = model.displayEntityKey || '_displayName';

    const entityPickerFilter = useMemo<ITableViewProps[]>(() => {
      return [
        {
          defaultSelected: true,
          expression: { ...filters },
          id: 'uZ4sjEhzO7joxO6kUvwdb',
          name: 'entity Picker',
          selected: true,
          sortOrder: 0,
        },
      ];
    }, [filters]);

    const incomeValueFunc: IncomeValueFunc = useCallback((value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value ? value.id : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression<string>(model.incomeCustomJs, { ...args, value }, null, null);
      }
      return value;
    }, [model.valueFormat, model.incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value
          ? { id: value.id, _displayName: getValueByPropertyName(value, displayEntityKey) ?? value._displayName, _className: model.entityType }
          : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression(model.outcomeCustomJs, { ...args, value }, null, null);
      }
      return !!value ? value.id : null;
    }, [model.valueFormat, model.outcomeCustomJs, displayEntityKey, model.entityType]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const width = modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth;

    const finalStyle = model.allStyles.fullStyle;

    return (
      <ConfigurableFormItem model={model} initialValue={model.defaultValue}>
        {(value, onChange) => {

          const customEvent = customOnChangeValueEventHandler(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function')
              onChange(...args);
          };
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
              addNewRecordsProps={
                model.allowNewRecord
                  ? {
                    modalFormId: model.modalFormId,
                    modalTitle: model.modalTitle,
                    showModalFooter: model.showModalFooter,
                    modalWidth: customWidth ? `${customWidth}${widthUnits}` : modalWidth,
                    buttons: model?.buttons,
                    footerButtons: model?.footerButtons
                  }
                  : undefined
              }
              name={model?.componentName}
              width={width}
              configurableColumns={model.items ?? []}
              value={value}
              onChange={onChangeInternal}
              size={model.size}
              dividerStyle={model.border?.border?.middle}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: m => m
    .add<IEntityPickerComponentProps>(0, prev => {
      return {
        ...prev,
        items: prev['items'] ?? [],
        mode: prev['mode'] ?? 'single',
        entityType: prev['entityType'],
      };
    })
    .add<IEntityPickerComponentProps>(1, migrateV0toV1)
    .add<IEntityPickerComponentProps>(2, prev => {
      return { ...prev, useRawValues: true };
    })
    .add<IEntityPickerComponentProps>(3, prev => {
      const result = { ...prev };
      const useExpression = Boolean(result['useExpression']);
      delete result['useExpression'];

      if (useExpression) {
        const migratedExpression = migrateDynamicExpression(prev.filters);
        result.filters = migratedExpression;
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
        : prev['useRawValue'] === true
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
    .add<IEntityPickerComponentProps>(10, (prev) => ({ ...prev, desktop: { ...defaultStyles(prev) }, mobile: { ...defaultStyles(prev) }, tablet: { ...defaultStyles(prev) } })),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),

  linkToModelMetadata: (model, propMetadata): IEntityPickerComponentProps => {
    return {
      ...model,
      editMode: 'inherited',
      entityType: isEntityReferencePropertyMetadata(propMetadata)
        ? propMetadata.entityType
        : isEntityReferenceArrayPropertyMetadata(propMetadata)
          ? propMetadata.entityType
          : undefined,
      mode: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'multiple' : 'single',
      valueFormat: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'entityReference' : 'simple',
    };
  },
  getFieldsToFetch: (propertyName, rawModel) => {
    if (rawModel.valueFormat === 'entityReference') {
      return [
        `${propertyName}.id`,
        rawModel.displayEntityKey
          ? `${propertyName}.${rawModel.displayEntityKey}`
          : `${propertyName}._displayName`,
        `${propertyName}._className`
      ];
    }
    return null;
  },
  validateModel: (model, addModelError) => {
    if (!model.entityType) addModelError('entityType', 'Select `Entity Type` on the settings panel');
  },
};

export default EntityPickerComponent;