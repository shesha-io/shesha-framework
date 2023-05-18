import { FileSearchOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, { Key } from 'react';
import { axiosHttp } from 'utils/fetchers';
import { IToolboxComponent } from 'interfaces';
import { DataTypes } from 'interfaces/dataTypes';
import { useFormData, useGlobalState, useNestedPropertyMetadatAccessor, useSheshaApplication } from 'providers';
import { useForm } from 'providers/form';
import { FormMarkup } from 'providers/form/models';
import {
  evaluateString,
  evaluateValue,
  getStyle,
  replaceTags,
  validateConfigurableComponentSettings,
} from 'providers/form/utils';
import Autocomplete, { ISelectOption } from 'components/autocomplete';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { customDropDownEventHandler } from 'components/formDesigner/components/utils';
import settingsFormJson from './settingsForm.json';
import moment from 'moment';
import { isEmpty } from 'lodash';
import camelCaseKeys from 'camelcase-keys';
import { evaluateDynamicFilters } from 'providers/dataTable/utils';
import { IAutocompleteComponentProps } from './interfaces';
import { migrateDynamicExpression } from 'designer-components/_common-migrations/migrateUseExpression';
import { useAsyncMemo } from 'hooks/useAsyncMemo';

interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [name: string]: Key;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteComponent: IToolboxComponent<IAutocompleteComponentProps> = {
  type: 'autocomplete',
  isInput: true,
  isOutput: true,
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  factory: (model: IAutocompleteComponentProps, _c, form) => {
    const { queryParams, filter } = model;
    const { formMode, isComponentDisabled, setFormDataAndInstance } = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(
      model.dataSourceType === 'entitiesList' ? model.entityTypeShortAlias : null
    );

    const dataSourceUrl = model.dataSourceUrl ? replaceTags(model.dataSourceUrl, { data: data }) : model.dataSourceUrl;

    const disabled = isComponentDisabled(model);

    const evaluatedFilters = useAsyncMemo(async () => {
      if (!filter) return '';

      const localFormData = !isEmpty(data) ? camelCaseKeys(data, { deep: true, pascalCase: true }) : data;

      const response = await evaluateDynamicFilters(
        [{ expression: filter } as any],
        [
          {
            match: 'data',
            data: localFormData,
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

    const eventProps = {
      model,
      form,
      formData: data,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData: setFormDataAndInstance,
      setGlobalState,
    };

    const autocompleteProps = {
      className: 'sha-autocomplete',
      typeShortAlias: model.entityTypeShortAlias,
      entityDisplayProperty: model.entityDisplayProperty,
      allowInherited: true /*hardcoded for now*/,
      disabled,
      bordered: !model.hideBorder,
      dataSourceUrl,
      dataSourceType: model.dataSourceType,
      mode: model.mode,
      placeholder: model.placeholder,
      queryParams: getQueryParams(),
      readOnly: model.readOnly || formMode === 'readonly',
      defaultValue: evaluateString(model.defaultValue, { data, formMode, globalState }) as any,
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

    // todo: implement other types of datasources!
    return (
      <ConfigurableFormItem model={model}>
        {model.useRawValues ? (
          <Autocomplete.Raw {...autocompleteProps} {...customDropDownEventHandler(eventProps)} />
        ) : (
          <Autocomplete.EntityDto {...autocompleteProps} {...customDropDownEventHandler(eventProps)} />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) =>
    m
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
      }),
  linkToModelMetadata: (model, metadata): IAutocompleteComponentProps => {
    return {
      ...model,
      //useRawValues: true,
      dataSourceType: 'entitiesList',
      entityTypeShortAlias: metadata.entityType,
      mode: undefined,
    };
  },
};

export default AutocompleteComponent;
