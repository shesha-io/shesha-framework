import { FileSearchOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import {
  executeExpression,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { AutocompleteComponentDefinition, IAutocompleteComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ConfigurableFormItem } from '@/components';
import { customDropDownEventHandler } from '@/components/formDesigner/components/utils';
import { getValueByPropertyName, isRecord } from '@/utils/object';
import { DisplayValueFunc, FilterSelectedFunc, KayValueFunc, OutcomeValueFunc } from '@/components/autocomplete/models';
import { Autocomplete } from '@/components/autocomplete';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useMetadataDispatcher } from '@/providers';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isEntityReferenceId } from '@/utils/entity';
import { isDefined } from '@/utils/nullables';

const AutocompleteComponent: AutocompleteComponentDefinition = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.entityReference ||
    (dataType === DataTypes.array && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(dataFormat)),
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    const { getMetadata } = useMetadataDispatcher();

    const entityMetadata = useAsyncMemo(async () => {
      if (isEntityTypeIdEmpty(model.entityType))
        return null;
      const meta = await getMetadata({ modelType: model.entityType, dataType: DataTypes.entityReference });
      return isEntityMetadata(meta) ? meta : null;
    }, [model.entityType]);

    const keyPropName = model.keyPropName || (model.dataSourceType === 'entitiesList' ? 'id' : 'value');
    const displayPropName = model.displayPropName || (model.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');

    const keyValueFunc: KayValueFunc = useCallback((value: unknown, args: object) => {
      if (!isDefined(value)) return value;
      if (model.valueFormat === 'custom' && model.keyValueFunc)
        return executeExpression<string>(model.keyValueFunc, { ...args, value }, null, null);
      if (model.valueFormat === 'entityReference' && isEntityReferenceId(value))
        return value?.id;
      return typeof (value) === 'object' ? getValueByPropertyName(value as Record<string, unknown>, keyPropName) : value;
    }, [model.valueFormat, model.keyValueFunc, keyPropName]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((item: unknown, args: object) => {
      if (!isDefined(item)) return item;

      if (model.valueFormat === 'entityReference') {
        // If already a valid entity reference, preserve it
        if (isEntityReferenceId(item)) {
          return {
            id: item.id,
            _displayName: getValueByPropertyName(item as Record<string, unknown>, displayPropName) || item._displayName,
            _className: item._className || entityMetadata?.fullClassName, // Preserve existing _className first
          };
        }

        // If plain value (not object)
        if (typeof item !== 'object') {
          return {
            id: item,
            _displayName: String(item ?? ''),
            _className: entityMetadata?.fullClassName,
          };
        }

        // Return arrays unchanged
        if (Array.isArray(item)) {
          return item;
        }

        // Build entity reference from object (item is a non-null object given the guards above)
        if (isRecord(item)) {
          return {
            id: getValueByPropertyName(item, 'id') ?? item.id,
            _displayName: getValueByPropertyName(item, displayPropName) || item._displayName,
            _className: item._className || entityMetadata?.fullClassName,
          };
        }
        return item;
      }

      if (model.valueFormat === 'custom' && model.outcomeValueFunc)
        return executeExpression(model.outcomeValueFunc, { ...args, item: item }, null, null);
      return typeof (item) === 'object' ? getValueByPropertyName(item as Record<string, unknown>, keyPropName) : item;
    }, [model.valueFormat, model.outcomeValueFunc, keyPropName, displayPropName, entityMetadata]);

    const displayValueFunc: DisplayValueFunc = useCallback((value: unknown, args: object) => {
      if (!isDefined(value)) return value;
      if (model.displayValueFunc)
        return executeExpression(model.displayValueFunc, { ...args, item: value }, null, null);
      return (typeof (value) === 'object' ? getValueByPropertyName(value as Record<string, unknown>, displayPropName) : value) || '';
    }, [model.displayValueFunc, displayPropName]);

    const filterKeysFunc: FilterSelectedFunc = useCallback((value: unknown) => {
      const localValue = Array.isArray(value) && value?.length === 1 ? value[0] : value;
      return Array.isArray(localValue)
        ? { or: localValue.map((x) => executeExpression(model.filterKeysFunc, { value: x }, null, null)) }
        : executeExpression(model.filterKeysFunc, { value: localValue }, null, null);
    }, [model.filterKeysFunc]);

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle;

    return (
      <ConfigurableFormItem {...{ model }}>
        {(value, onChange) => {
          const customEvent = customDropDownEventHandler(model, allData);
          const onChangeInternal = (value: unknown, option?: unknown): void => {
            if (typeof value === 'object' && value !== null) {
              customEvent.onChange(value, option);
            }
            if (typeof onChange === 'function')
              onChange(value);
          };


          return (
            <Autocomplete
              {...model}
              grouping={model.grouping?.length > 0 ? model.grouping[0] : undefined}
              keyValueFunc={keyValueFunc}
              outcomeValueFunc={outcomeValueFunc}
              displayValueFunc={displayValueFunc}
              filterKeysFunc={model.filterKeysFunc ? filterKeysFunc : undefined}
              style={finalStyle}
              size={model?.size ?? 'middle'}
              value={value}
              onChange={onChangeInternal}
              allowFreeText={model.allowFreeText && model.valueFormat === 'simple'}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
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
        stylingBox: prev.stylingBox,
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
    .add<IAutocompleteComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, propMetadata): IAutocompleteComponentProps => {
    return {
      ...model,
      dataSourceType: 'entitiesList',
      mode: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'multiple' : 'single',
      entityType: isEntityReferencePropertyMetadata(propMetadata)
        ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
        : isEntityReferenceArrayPropertyMetadata(propMetadata)
          ? { name: propMetadata.itemsType?.entityType, module: propMetadata.itemsType?.entityModule ?? null }
          : undefined,
      valueFormat: isEntityReferencePropertyMetadata(propMetadata) || isEntityReferenceArrayPropertyMetadata(propMetadata)
        ? 'entityReference'
        : 'simple',
      filter: isHasFilter(propMetadata.formatting)
        ? { ...propMetadata.formatting?.filter }
        : null,
    };
  },
  actualModelPropertyFilter: (propName) => propName !== 'queryParams',
  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.valueFormat === 'entityReference'
      ? [`${propertyName}.id`, `${propertyName}._className`, `${propertyName}._displayName`]
      : [propertyName];
  },
};

export default AutocompleteComponent;
