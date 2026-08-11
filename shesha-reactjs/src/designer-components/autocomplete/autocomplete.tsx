/* The migrator reads deprecated model properties (stylingBox, useRawValues, entityTypeShortAlias)
   on purpose — upgrading forms saved against those shapes is what it is for. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { Autocomplete } from '@/components/autocomplete';
import { AUTOCOMPLETE_DATA_SOURCE_TYPE, AutocompleteDataSourceType, AutocompleteSelectRef, DisplayValueFunc, FilterSelectedFunc, KayValueFunc, OutcomeValueFunc } from '@/components/autocomplete/models';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { isEntityMetadata, isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata, isHasFilter } from '@/interfaces/metadata';
import { useMetadataDispatcher } from '@/providers';
import { useComponentApi } from '@/providers/componentApi/provider';
import { IInputStyles } from '@/providers/form/models';
import {
  executeExpression, validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isNonEmptyArray } from '@/utils/array';
import { getNestedStringOrUndefined } from '@/utils/dotnotation';
import { isEntityReferenceId } from '@/utils/entity';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getBooleanPropertyOrUndefined, getStringEnumOrDefault, getStringPropertyOrUndefined, getValueByPropertyName, pick } from '@/utils/object';
import { FileSearchOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { AutocompleteApi } from '../../componentsApi/componentApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';
import { AutocompleteComponentDefinition, IAutocompleteComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { defaultStyles } from './utils';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const AutocompleteComponent: AutocompleteComponentDefinition = {
  allowInherit: true,
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

    const componentApi = useComponentApi();
    const selectRef = useRef<AutocompleteSelectRef>(null);
    useEffect(() => {
      componentApi?.updateApi<AutocompleteApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'AutocompleteApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'multiple', getter: () => model.mode === 'multiple' },
        ],
        api: { focus: () => selectRef.current?.focus() },
      });
    }, [componentApi, model.componentName, model.id, model.mode]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    const entityMetadata = useAsyncMemo(async () => {
      if (isEntityTypeIdEmpty(model.entityType))
        return null;
      const meta = await getMetadata({ modelType: model.entityType, dataType: DataTypes.entityReference });
      return isEntityMetadata(meta) ? meta : null;
    }, [model.entityType]);

    const keyPropName = !isNullOrWhiteSpace(model.keyPropName)
      ? model.keyPropName
      : (model.dataSourceType === 'entitiesList' ? 'id' : 'value');
    const displayPropName = !isNullOrWhiteSpace(model.displayPropName)
      ? model.displayPropName
      : (model.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');

    const keyValueFunc = useCallback<KayValueFunc>((value, args) => {
      if (!isDefined(value))
        return undefined;
      if (model.valueFormat === 'custom' && !isNullOrWhiteSpace(model.keyValueFunc))
        return executeExpression<string>(model.keyValueFunc, { ...args, value }, null, undefined) ?? undefined;
      if (model.valueFormat === 'entityReference' && isEntityReferenceId(value))
        return value.id;
      const result = typeof (value) === 'object'
        ? getValueByPropertyName(value as Record<string, unknown>, keyPropName)
        : value;
      return typeof (result) === "object"
        ? undefined
        : result?.toString();
    }, [model.valueFormat, model.keyValueFunc, keyPropName]);

    const outcomeValueFunc = useCallback<OutcomeValueFunc>((item, args) => {
      if (!isDefined(item)) return item;
      if (model.valueFormat === 'entityReference')
        return isEntityReferenceId(item)
          ? {
            id: item.id,
            _displayName: getNestedStringOrUndefined(item, displayPropName) ?? item._displayName,
            _className: (!isNullOrWhiteSpace(item._className) ? item._className : entityMetadata?.fullClassName) ?? undefined,
          }
          : typeof (item) !== 'object'
            ? { id: item, _displayName: item.toString(), _className: undefined }
            : item;
      if (model.valueFormat === 'custom' && !isNullOrWhiteSpace(model.outcomeValueFunc))
        return executeExpression(model.outcomeValueFunc, { ...args, item: item }, null, undefined);
      return typeof (item) === 'object' ? getValueByPropertyName(item as Record<string, unknown>, keyPropName) : item;
    }, [model.valueFormat, model.outcomeValueFunc, keyPropName, displayPropName, entityMetadata]);

    const displayValueFunc = useCallback<DisplayValueFunc>((value, args) => {
      if (!isDefined(value)) return '';
      const raw = !isNullOrWhiteSpace(model.displayValueFunc)
        ? executeExpression(model.displayValueFunc, { ...args, item: value }, null, undefined)
        : (typeof (value) === 'object' ? getValueByPropertyName(value as Record<string, unknown>, displayPropName) : value);
      if (raw === null || raw === undefined) return '';
      return typeof raw === 'object' ? '' : String(raw);
    }, [model.displayValueFunc, displayPropName]);

    const {
      filterKeysFunc: filterKeysFuncExpression,
      allowFreeText = false,
    } = model;

    const filterKeysFunc: FilterSelectedFunc = useCallback((value) => {
      if (model.valueFormat !== 'custom' || isNullOrWhiteSpace(filterKeysFuncExpression))
        return undefined;

      if (!isDefined(value)) return undefined;

      const localValue = Array.isArray(value) && isNonEmptyArray<object>(value) && value.length === 1
        ? value[0]
        : value;
      const result: JsonLogicFilter | undefined = Array.isArray(localValue)
        ? { or: localValue.map((x) => executeExpression(filterKeysFuncExpression, { value: x }, null, undefined)) }
        : executeExpression<JsonLogicFilter>(filterKeysFuncExpression, { value: localValue }, null, undefined) ?? undefined;
      return result;
    }, [filterKeysFuncExpression, model.valueFormat]);

    return (
      <ConfigurableFormItem {...{ model }}>
        {(value, onChange, _, ctx) => {
          const autocompleteProps = pick(model, [
            "dataSourceType",
            "dataSourceUrl",
            "entityType",
            "filter",
            "queryParams",
            "fields",
            "sorting",
            "readOnly",
            "placeholder",
            "disableSearch",
            "keyPropName",
            "displayPropName",
            "mode",
            "quickviewEnabled",
            "quickviewFormPath",
            "quickviewDisplayPropertyName",
            "quickviewGetEntityUrl",
            "quickviewWidth",
          ]);

          return (
            <Autocomplete
              {...autocompleteProps}
              // The model stores grouping as a list for the editor; the control takes a single item.
              grouping={isNonEmptyArray(model.grouping) ? model.grouping[0] : undefined}
              keyValueFunc={keyValueFunc}
              outcomeValueFunc={outcomeValueFunc}
              displayValueFunc={displayValueFunc}
              filterKeysFunc={isNotNullOrWhiteSpace(filterKeysFuncExpression) ? filterKeysFunc : undefined}
              className={styles.autocomplete}
              // Custom style is passed through as-is; everything else is emitted as CSS by
              // `useStyles` so unset properties keep cascading from the theme.
              {...(isDefined(model.styleJson) ? { style: model.styleJson } : {})}
              // Read-only rendering happens outside the select, where the emotion class does not
              // reach, so the style model is handed over as a value for that path.
              styleValue={model}
              enableStyleOnReadonly={model.enableStyleOnReadonly}
              size={model.size ?? 'middle'}
              value={value}
              selectRef={selectRef}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue);
              }}
              events={getComponentEvents(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.entityReference)}
              allowFreeText={allowFreeText && model.valueFormat === 'simple'}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  previewConfiguration: {
    type: 'autocomplete',
    id: 'autocomplete',
    propertyName: `autocompleteAppearance`,
    label: `Autocomplete Label`,
    version: 'latest',
    dataSourceType: 'entitiesList',
    mode: 'single',
  },
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
    // Steps 6 and 8 back-fill styles for forms saved before those settings existed. A newly dropped
    // component ships empty and inherits from the entity model instead, so both are a no-op on it.
    .add<IAutocompleteComponentProps>(6, (prev, context) => {
      if (context.isNew === true) return prev;

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
    // Derives the current property shape from the legacy `useRawValues`/`entityTypeShortAlias`
    // settings. A new component has none of those and inherits from the entity model instead.
    .add<IAutocompleteComponentProps>(7, (prev, context) => {
      if (context.isNew === true) return prev;

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
        keyPropName: prev.dataSourceType === 'url' && useRawValues ? prev.keyPropName ?? 'value' : prev.keyPropName,
      };
    })
    .add<IAutocompleteComponentProps>(8, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IAutocompleteComponentProps>(9, (prev) => {
      /* Forms saved before step 7 stored `mode` as a single-element array (`["single"]`) because the
         setting used to be a multi-select. The runtime compares it strictly against 'multiple', so a
         saved `["multiple"]` silently behaves as single-select until it is unwrapped. */
      const rawMode: unknown = prev.mode;
      const mode: IAutocompleteComponentProps['mode'] = Array.isArray(rawMode)
        ? (rawMode as IAutocompleteComponentProps['mode'][])[0]
        : prev.mode;
      return migratePermissionsToVisiblePermissions(migrateHiddenToVisible({
        ...prev,
        ...(isDefined(mode) ? { mode } : {}),
      }));
    }),
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
