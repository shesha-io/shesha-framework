import { FileSearchOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import {
  executeExpression,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { IAutocompleteComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ConfigurableFormItem } from '@/components';
import { customDropDownEventHandler } from '@/components/formDesigner/components/utils';
import { getValueByPropertyName } from '@/utils/object';
import { FilterSelectedFunc, KayValueFunc, OutcomeValueFunc } from '@/components/autocomplete/models';
import { Autocomplete } from '@/components/autocomplete';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

const AutocompleteComponent: IToolboxComponent<IAutocompleteComponentProps> = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();

    const keyPropName = model.keyPropName || (model.dataSourceType === 'entitiesList' ? 'id' : 'value');
    const displayPropName = model.displayPropName || (model.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');
  
    const keyValueFunc: KayValueFunc = useCallback( (value: any, args: any) => {
      if (model.valueFormat === 'custom' && model.keyValueFunc) 
        return executeExpression<string>(model.keyValueFunc, {...args, value}, null, null );
      if (model.valueFormat === 'entityReference') 
        return value?.id;
      return typeof(value) === 'object' ? getValueByPropertyName(value, keyPropName) : value;
    }, [model.valueFormat, model.keyValueFunc, keyPropName]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((item: any, args: any) => {
      if (model.valueFormat === 'entityReference')
        return Boolean(item)
          ? {id: item.id, _displayName: item._displayName || getValueByPropertyName(item, displayPropName), _className: model.entityType}
          : null;
      if (model.valueFormat === 'custom' && model.outcomeValueFunc)
        return executeExpression(model.outcomeValueFunc, {...args, item: item}, null, null );
      return typeof(item) === 'object' ? getValueByPropertyName(item, keyPropName) : item;
    }, [model.valueFormat, model.outcomeValueFunc, keyPropName, displayPropName, model.entityType]);

    const displayValueFunc: OutcomeValueFunc = useCallback((value: any, args: any) => {
      if (model.displayValueFunc)
        return executeExpression(model.displayValueFunc, {...args, item: value}, null, null );
      return getValueByPropertyName(value, displayPropName) || ''; 
    }, [model.displayValueFunc, displayPropName]);

    const filterKeysFunc: FilterSelectedFunc = useCallback((value: any | any[]) => {
      const localValue = value?.length === 1 ? value[0] : value;
      return Array.isArray(localValue)
        ? { or : localValue.map(x => executeExpression(model.filterKeysFunc, {value: x}, null, null )) }
        : executeExpression(model.filterKeysFunc, {value: localValue}, null, null );
    }, [model.filterKeysFunc]);

    return (
      <ConfigurableFormItem {...{model}}>
        {(value, onChange) => {
          const customEvent = customDropDownEventHandler(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function')
              onChange(...args);
          };


          return <Autocomplete
            {...model}
            grouping={model.grouping?.length > 0 ? model.grouping[0] : undefined}
            keyValueFunc={keyValueFunc}
            outcomeValueFunc={outcomeValueFunc}
            displayValueFunc={displayValueFunc}
            filterKeysFunc={model.filterKeysFunc ? filterKeysFunc : undefined}
            style={model?.allStyles?.fullStyle}
            size={model?.size ?? 'middle'}
            value={value}
            onChange={onChangeInternal} 
            allowFreeText={model.allowFreeText && model.valueFormat === 'simple'}
          />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IAutocompleteComponentProps>(0, (prev) => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'entitiesList',
      useRawValues: prev['useRawValues'] ?? false,
    }))
    .add<IAutocompleteComponentProps>(1, (prev) => {
      const result = { ...prev };
      const useExpression = Boolean(result['useExpression']);
      delete result['useExpression'];

      if (useExpression) {
        const migratedExpression = migrateDynamicExpression(prev.filter);
        result.filter = migratedExpression;
      }

      return result;
    })
    .add<IAutocompleteComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAutocompleteComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IAutocompleteComponentProps>(4, (prev) => migrateReadOnly(prev))
    .add<IAutocompleteComponentProps>(5, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
      defaultValue: migrateFormApi.withoutFormData(prev?.defaultValue),
    }))
    .add<IAutocompleteComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius ?? 8,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IAutocompleteComponentProps>(7, (prev) => {
      return { 
        ...prev,
        mode: prev.mode || 'single',
        entityType: prev.entityType || prev['entityTypeShortAlias'],
        valueFormat: prev.dataSourceType === 'entitiesList'
          ? prev['useRawValues'] ? 'simple' : 'entityReference'
          : 'simple',
        displayPropName: prev.dataSourceType === 'entitiesList' 
          ? prev['entityDisplayProperty'] 
          : prev['useRawValues']
            ? prev['valuePropName'] || 'displayText'
            : prev['valuePropName'],
        keyPropName: prev.dataSourceType === 'url' && prev['useRawValues'] ? prev.keyPropName || 'value' : prev.keyPropName,
      };
    })
    .add<IAutocompleteComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
  linkToModelMetadata: (model, propMetadata): IAutocompleteComponentProps => {
    return {
      ...model,
      dataSourceType: 'entitiesList',
      mode: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'multiple' : 'single',
      entityType: isEntityReferencePropertyMetadata(propMetadata)
        ? propMetadata.entityType 
        : isEntityReferenceArrayPropertyMetadata(propMetadata)
          ? propMetadata.entityType
          : undefined,
      valueFormat: isEntityReferencePropertyMetadata(propMetadata) || isEntityReferenceArrayPropertyMetadata(propMetadata)
        ? 'entityReference' 
        : 'simple',
    };
  },
  actualModelPropertyFilter: (propName) => propName !== 'queryParams',
  getFieldsToFetch(propertyName, rawModel) {
    return rawModel.valueFormat === 'entityReference'
      ? [`${propertyName}.id`, `${propertyName}._className`, `${propertyName}._displayName`]
      : [propertyName];
  },
};

export default AutocompleteComponent;