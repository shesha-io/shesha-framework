import { FileSearchOutlined } from '@ant-design/icons';
import React, { CSSProperties, Key, useEffect, useMemo, useState } from 'react';
import { Autocomplete, IAutocompleteProps, ISelectOption } from '@/components/autocomplete';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDropDownEventHandler } from '@/components/formDesigner/components/utils';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useNestedPropertyMetadatAccessor, useSheshaApplication } from '@/providers';
import {
  executeExpression,
  getStyle,
  pickStyleFromModel,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { IAutocompleteComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityReferenceArrayPropertyMetadata, isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from '../textField/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { toSizeCssProp } from '@/utils/form';
interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [name: string]: Key;
}


const AutocompleteComponent: IToolboxComponent<IAutocompleteComponentProps> = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model }) => {
    const { queryParams, filter } = model;
    const allData = useAvailableConstantsData();

    const localStyle = getStyle(model.style, allData.data);

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const { backendUrl, httpHeaders } = useSheshaApplication();
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, localStyle), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
      const fetchStyles = async () => {
        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, localStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(
      model.dataSourceType === 'entitiesList' ? model.entityTypeShortAlias : null
    );

    const dataSourceUrl = model.dataSourceUrl ? replaceTags(model.dataSourceUrl, { data: allData.data }) : model.dataSourceUrl;

    const evaluatedFilters = useAsyncMemo(async () => {
      if (model.dataSourceType !== 'entitiesList' || !filter)
        return '';

      const response = await evaluateDynamicFilters(
        [{ expression: filter } as any],
        [
          {
            match: 'data',
            data: allData.data,
          },
          {
            match: 'globalState',
            data: allData.globalState,
          },
          {
            match: 'pageContext',
            data: { ...allData.pageContext },
          },
        ],
        propertyMetadataAccessor
      );

      if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

      return JSON.stringify(response[0]?.expression) || '';
    }, [filter, allData.data, allData.globalState]);

    const getQueryParams = (): IQueryParams => {
      const queryParamObj: IQueryParams = {};

      if (model.dataSourceType === 'url') {
        if (queryParams && typeof (queryParams) === 'object') {
          if (Array.isArray(queryParams)) {
            queryParams.forEach(({ param, value }) => {
              const valueAsString = value as string;
              if (param?.length && valueAsString.length) {
                queryParamObj[param] = /{.*}/i.test(valueAsString) ? evaluateString(valueAsString, { data: allData.data }) : value;
              }
            });
          } else
            Object.assign(queryParamObj, queryParams);
        }
      }

      if (model.dataSourceType === 'entitiesList') {
        if (filter) queryParamObj['filter'] = typeof filter === 'string' ? filter : evaluatedFilters;
      }

      return queryParamObj;
    };

    const getFetchedItemData = (
      item: object,
      useRawValues: boolean,
      value: string = 'value',
      displayText: string = 'displayText'
    ) =>
      useRawValues
        ? item[value]
        : {
          id: item[value],
          _displayName: item[displayText],
          _className: model.entityTypeShortAlias,
        };

    const getOptionFromFetchedItem = (item: object): ISelectOption => {
      const { dataSourceType, keyPropName, useRawValues, valuePropName } = model;

      if (dataSourceType === 'url' && keyPropName && valuePropName) {
        return {
          value: item[keyPropName],
          label: item[valuePropName],
          data: getFetchedItemData(item, useRawValues, keyPropName, valuePropName),
        };
      }

      return {
        value: item['value'],
        label: item['displayText'],
        data: getFetchedItemData(item, useRawValues),
      };
    };

    const getDefaultValue = () => {
      try {
        if (model?.defaultValue) {
          return executeScriptSync(model?.defaultValue, allData);
        }
      } catch {
        return undefined;
      }
    };

    
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const additionalStyles: CSSProperties = removeUndefinedProps({
      height: toSizeCssProp(model?.dimensions?.height),
      width: toSizeCssProp(model?.dimensions?.width),
      fontWeight: model.fontWeight,
      borderWidth: model.borderSize,
      borderRadius: model.borderRadius || '8px',
      borderStyle: model.borderType,
      borderColor: model.borderColor,
      backgroundColor: model.backgroundColor,
      fontSize: model.fontSize,
      overflow: 'hidden', //this allows us to retain the borderRadius even when the component is active
      ...stylingBoxAsCSS,
    });
    const jsStyle = getStyle(model.style, allData.data);
    const finalStyle = removeUndefinedProps({ ...jsStyle, ...additionalStyles, ...backgroundStyles, ...borderStyles, ...shadowStyles, ...fontStyles, ...dimensionsStyles });

    const defaultValue = getDefaultValue();

    const autocompleteProps: IAutocompleteProps = {
      className: 'sha-autocomplete',
      typeShortAlias: model.entityTypeShortAlias,
      entityDisplayProperty: model.entityDisplayProperty,
      allowInherited: true /*hardcoded for now*/,
      bordered: model.border.hideBorder,
      dataSourceUrl,
      dataSourceType: model.dataSourceType,
      mode: model.mode,
      placeholder: model.placeholder,
      queryParams: getQueryParams(),
      readOnly: model.readOnly,
      defaultValue,
      getOptionFromFetchedItem,
      disableSearch: model.disableSearch,
      filter: evaluatedFilters,
      quickviewEnabled: model.quickviewEnabled,
      quickviewFormPath: model.quickviewFormPath,
      quickviewDisplayPropertyName: model.quickviewDisplayPropertyName,
      quickviewGetEntityUrl: model.quickviewGetEntityUrl,
      quickviewWidth: model.quickviewWidth,
      subscribedEventNames: model.subscribedEventNames,
      style: finalStyle,
      size: model.size,
      allowFreeText: model.allowFreeText,
    };

    const formProps = defaultValue ? { model, initialValue: defaultValue } : { model };

    // TODO: implement other types of datasources!

    return (
      <ConfigurableFormItem {...{model}}>
        {(value, onChange) => {
          const customEvent = customDropDownEventHandler(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function')
              onChange(...args);
          };
          return (
            model.useRawValues ? (
              <Autocomplete.Raw {...autocompleteProps} {...customEvent} value={value} onChange={onChangeInternal} />
            ) : (
              <Autocomplete.EntityDto {...autocompleteProps} {...customEvent} value={value} onChange={onChangeInternal} />
            ));
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
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
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IAutocompleteComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))


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
};

export default AutocompleteComponent;