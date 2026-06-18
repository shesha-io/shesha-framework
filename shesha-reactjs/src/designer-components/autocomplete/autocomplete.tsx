import { FileSearchOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import {
  executeExpression, validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { AutocompleteComponentDefinition, IAutocompleteComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { getBooleanPropertyOrUndefined, getStringEnumOrDefault, getStringPropertyOrUndefined, getValueByPropertyName } from '@/utils/object';
import { AUTOCOMPLETE_DATA_SOURCE_TYPE, AutocompleteDataSourceType, DisplayValueFunc, FilterSelectedFunc, KayValueFunc, OutcomeValueFunc } from '@/components/autocomplete/models';
import { Autocomplete } from '@/components/autocomplete';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useMetadataDispatcher } from '@/providers';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isEntityReferenceId } from '@/utils/entity';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

const AutocompleteComponent: AutocompleteComponentDefinition = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.entityReference ||
    (dataType === DataTypes.array && isDefined(dataFormat) && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(dataFormat)),
  Factory: ({ model }) => {
    const { getMetadata } = useMetadataDispatcher();

    const entityMetadata = useAsyncMemo(async () => {
      if (isEntityTypeIdEmpty(model.entityType))
        return null;
      const meta = await getMetadata({ modelType: model.entityType, dataType: DataTypes.entityReference });
      return isEntityMetadata(meta) ? meta : null;
    }, [model.entityType]);

    const keyPropName = model.keyPropName || (model.dataSourceType === 'entitiesList' ? 'id' : 'value');
    const displayPropName = model.displayPropName || (model.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');

    const keyValueFunc = useCallback<KayValueFunc>((value, args) => {
      if (!isDefined(value)) return value;
      if (model.valueFormat === 'custom' && model.keyValueFunc)
        return executeExpression<string>(model.keyValueFunc, { ...args, value }, null, undefined);
      if (model.valueFormat === 'entityReference' && isEntityReferenceId(value))
        return value.id;
      return typeof (value) === 'object' ? getValueByPropertyName(value as Record<string, unknown>, keyPropName) : value;
    }, [model.valueFormat, model.keyValueFunc, keyPropName]);

    const outcomeValueFunc = useCallback<OutcomeValueFunc>((item, args) => {
      if (!isDefined(item)) return item;
      if (model.valueFormat === 'entityReference')
        return isEntityReferenceId(item)
          ? {
            id: item.id,
            _displayName: getValueByPropertyName(item as Record<string, unknown>, displayPropName) || item._displayName,
            _className: (item._className || entityMetadata?.fullClassName) ?? undefined,
          }
          : typeof (item) !== 'object'
            ? { id: item, _displayName: item.toString(), _className: undefined }
            : item;
      if (model.valueFormat === 'custom' && model.outcomeValueFunc)
        return executeExpression(model.outcomeValueFunc, { ...args, item: item }, null, undefined);
      return typeof (item) === 'object' ? getValueByPropertyName(item as Record<string, unknown>, keyPropName) : item;
    }, [model.valueFormat, model.outcomeValueFunc, keyPropName, displayPropName, entityMetadata]);

    const displayValueFunc = useCallback<DisplayValueFunc>((value, args) => {
      if (!isDefined(value)) return '';
      const raw = model.displayValueFunc
        ? executeExpression(model.displayValueFunc, { ...args, item: value }, null, undefined)
        : (typeof (value) === 'object' ? getValueByPropertyName(value as Record<string, unknown>, displayPropName) : value);
      if (raw === null || raw === undefined) return '';
      return typeof raw === 'object' ? '' : String(raw);
    }, [model.displayValueFunc, displayPropName]);

    const { filterKeysFunc: filterKeysFuncExpression } = model;
    const filterKeysFunc: FilterSelectedFunc = useCallback((value) => {
      if (isNullOrWhiteSpace(filterKeysFuncExpression))
        return {} as JsonLogicFilter;
      if (!isDefined(value)) return {};

      const localValue = Array.isArray(value) && isNonEmptyArray<object>(value) && value.length === 1
        ? value[0]
        : value;
      const result: JsonLogicFilter = Array.isArray(localValue)
        ? { or: localValue.map((x) => executeExpression(filterKeysFuncExpression, { value: x }, null, undefined)) }
        : executeExpression<JsonLogicFilter>(filterKeysFuncExpression, { value: localValue }, null, undefined) ?? {};
      return result;
    }, [filterKeysFuncExpression]);

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles?.fontStyles,
      ...model.allStyles?.dimensionsStyles,
    } : model.allStyles?.fullStyle;

    return (
      <ConfigurableFormItem {...{ model }}>
        {(value, onChange, _, ctx) => {
          /* TODO EVENTS: review data type
          const customEvent = customDropDownEventHandler(model, allData);
          type StructuredValue = { id?: unknown; _displayName?: unknown; _className?: unknown };
          const isStructuredValue = (v: unknown): v is StructuredValue =>
            typeof v === 'object' && v !== null && !Array.isArray(v) &&
            ('id' in v || '_displayName' in v || '_className' in v);
          const isStructuredValueOrArray = (v: unknown): v is StructuredValue | StructuredValue[] =>
            isStructuredValue(v) || (Array.isArray(v) && v.every(isStructuredValue));
          const onChangeInternal = (value: unknown, option?: unknown): void => {
            if (isStructuredValueOrArray(value))
              customEvent.onChange(value, option);
            if (typeof onChange === 'function')
              onChange(value);
          };
          */

          return (
            <Autocomplete
              {...model}
              filter={model.filter}
              grouping={isNonEmptyArray(model.grouping) ? model.grouping[0] : undefined}
              keyValueFunc={keyValueFunc}
              outcomeValueFunc={outcomeValueFunc}
              displayValueFunc={displayValueFunc}
              filterKeysFunc={model.filterKeysFunc ? filterKeysFunc : undefined}
              style={finalStyle}
              size={model.size ?? 'middle'}
              value={value}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                onChange(newValue);
              }}
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
      dataSourceType: getStringEnumOrDefault<AutocompleteDataSourceType>(prev, "dataSourceType", AUTOCOMPLETE_DATA_SOURCE_TYPE) ?? "entitiesList",
      useRawValues: getBooleanPropertyOrUndefined(prev, "useRawValues") ?? false,
    }))
    .add<IAutocompleteComponentProps>(1, (prev) => {
      const result = { ...prev };
      const useExpression = getBooleanPropertyOrUndefined(prev, "useExpression") ?? false;
      if ("useExpression" in result)
        delete result['useExpression'];

      if (useExpression) {
        const migratedExpression = isDefined(prev.filter) ? migrateDynamicExpression(prev.filter) as JsonLogicFilter : undefined;
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
      const useRawValues = getBooleanPropertyOrUndefined(prev, 'useRawValues') === true;
      return {
        ...prev,
        mode: prev.mode || 'single',
        entityType: prev.entityType ?? getStringPropertyOrUndefined(prev, "entityTypeShortAlias"),
        valueFormat: prev.dataSourceType === 'entitiesList'
          ? useRawValues ? 'simple' : 'entityReference'
          : 'simple',
        displayPropName: prev.dataSourceType === 'entitiesList'
          ? getStringPropertyOrUndefined(prev, 'entityDisplayProperty')
          : useRawValues
            ? getStringPropertyOrUndefined(prev, "valuePropName") ?? 'displayText'
            : getStringPropertyOrUndefined(prev, "valuePropName"),
        keyPropName: prev.dataSourceType === 'url' && useRawValues ? prev.keyPropName || 'value' : prev.keyPropName,
      };
    })
    .add<IAutocompleteComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, propMetadata): IAutocompleteComponentProps => {
    return {
      ...model,
      dataSourceType: 'entitiesList',
      mode: isEntityReferenceArrayPropertyMetadata(propMetadata) ? 'multiple' : 'single',
      entityType: isEntityReferencePropertyMetadata(propMetadata) && !isNullOrWhiteSpace(propMetadata.entityType)
        ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
        : isEntityReferenceArrayPropertyMetadata(propMetadata) && !isNullOrWhiteSpace(propMetadata.itemsType.entityType)
          ? { name: propMetadata.itemsType.entityType, module: propMetadata.itemsType.entityModule ?? null }
          : undefined,
      valueFormat: isEntityReferencePropertyMetadata(propMetadata) || isEntityReferenceArrayPropertyMetadata(propMetadata)
        ? 'entityReference'
        : 'simple',
      filter: isHasFilter(propMetadata.formatting)
        ? { ...propMetadata.formatting.filter }
        : undefined,
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
