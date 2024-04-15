import { FileSearchOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';
import React, { Key } from 'react';
import { Autocomplete, IAutocompleteProps, ISelectOption } from '@/components/autocomplete';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDropDownEventHandler } from '@/components/formDesigner/components/utils';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useFormData, useGlobalState, useNestedPropertyMetadatAccessor, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import { FormMarkup } from '@/providers/form/models';
import {
  evaluateValue,
  getStyle,
  replaceTags,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { evaluateDynamicFilters } from '@/utils';
import { axiosHttp } from '@/utils/fetchers';
import { IAutocompleteComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [name: string]: Key;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteComponent: IToolboxComponent<IAutocompleteComponentProps> = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model, form }) => {
    const { queryParams, filter } = model;
    const { formMode, setFormData } = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(
      model.dataSourceType === 'entitiesList' ? model.entityTypeShortAlias : null
    );

    const dataSourceUrl = model.dataSourceUrl ? replaceTags(model.dataSourceUrl, { data: data }) : model.dataSourceUrl;

    const evaluatedFilters = useAsyncMemo(async () => {
      if (!filter) return '';

      const response = await evaluateDynamicFilters(
        [{ expression: filter } as any],
        [
          {
            match: 'data',
            data: data,
          },
          {
            match: 'globalState',
            data: globalState,
          },
        ],
        propertyMetadataAccessor
      );

      if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

      return JSON.stringify(response[0]?.expression) || '';
    }, [filter, data, globalState]);

    const getQueryParams = (): IQueryParams => {
      const queryParamObj: IQueryParams = {};

      if (queryParams?.length) {
        queryParams?.forEach(({ param, value }) => {
          const valueAsString = value as string;
          if (param?.length && valueAsString.length) {
            queryParamObj[param] = /{.*}/i.test(valueAsString) ? evaluateValue(valueAsString, { data }) : value;
          }
        });
      }

      if (filter) queryParamObj['filter'] = typeof filter === 'string' ? filter : evaluatedFilters;

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
          return new Function(
            'data, form, formMode, globalState, http, message, moment, setFormData, setGlobalState',
            model?.defaultValue
          )(
            data,
            form,
            formMode,
            globalState,
            axiosHttp(backendUrl),
            message,
            moment,
            setFormData,
            setGlobalState
          );
        }
      } catch (_e) {
        return undefined;
      }
    };

    const eventProps = {
      model,
      form,
      formData: data,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData,
      setGlobalState,
    };

    const defaultValue = getDefaultValue();

    const autocompleteProps: IAutocompleteProps = {
      className: 'sha-autocomplete',
      typeShortAlias: model.entityTypeShortAlias,
      entityDisplayProperty: model.entityDisplayProperty,
      allowInherited: true /*hardcoded for now*/,
      bordered: !model.hideBorder,
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
      style: getStyle(model.style, data),
      size: model.size,
      allowFreeText: model.allowFreeText,
    };

    const formProps = defaultValue ? { model, initialValue: getDefaultValue() } : { model };

    // todo: implement other types of datasources!


    return (
      <ConfigurableFormItem {...formProps}>
        {(value, onChange) => {
          const customEvent =  customDropDownEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function') 
              onChange(...args);
          };
         
          
          return (
          model.useRawValues ? (
            <Autocomplete.Raw {...autocompleteProps} {...customEvent} value={value} onChange={onChangeInternal}/>
          ) : (
            <Autocomplete.EntityDto {...autocompleteProps} {...customEvent} value={value} onChange={onChangeInternal}/>
          ));
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
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
  ,
  linkToModelMetadata: (model, propMetadata): IAutocompleteComponentProps => {
    return {
      ...model,
      //useRawValues: true,
      dataSourceType: 'entitiesList',
      entityTypeShortAlias: isEntityReferencePropertyMetadata(propMetadata) ? propMetadata.entityType : undefined,
      mode: undefined,
    };
  },
};

export default AutocompleteComponent;
