import { FileSearchOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, { Key, useMemo } from 'react';
import { axiosHttp } from '../../../../apis/axios';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { useGlobalState, useSheshaApplication } from '../../../../providers';
import { useForm } from '../../../../providers/form';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import {
  evaluateString,
  evaluateValue,
  getStyle,
  replaceTags,
  validateConfigurableComponentSettings,
} from '../../../../providers/form/utils';
import Autocomplete, { AutocompleteDataSourceType, ISelectOption } from '../../../autocomplete';
import ConfigurableFormItem from '../formItem';
import { customDropDownEventHandler } from '../utils';
import settingsFormJson from './settingsForm.json';
import moment from 'moment';
import { isEmpty } from 'lodash';
import camelCaseKeys from 'camelcase-keys';
import { evaluateDynamicFilters } from '../../../../providers/dataTable/utils';

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [name: string]: Key;
}

export interface IAutocompleteProps extends IConfigurableFormComponent {
  entityTypeShortAlias?: string;
  entityDisplayProperty?: string;
  hideBorder?: boolean;
  dataSourceUrl?: string;
  dataSourceType: AutocompleteDataSourceType;
  mode?: 'tags' | 'multiple';
  useRawValues: boolean;
  queryParams?: IQueryParamProp[];
  keyPropName?: string;
  valuePropName?: string;
  filter?: string;
  disableSearch?: boolean;
  placeholder?: string;
  quickviewEnabled?: boolean;
  quickviewFormPath?: string;
  quickviewDisplayPropertyName?: string;
  quickviewGetEntityUrl?: string;
  quickviewWidth?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  allowFreeText?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteComponent: IToolboxComponent<IAutocompleteProps> = {
  type: 'autocomplete',
  name: 'Autocomplete',
  icon: <FileSearchOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  factory: (model: IAutocompleteProps, _c, form) => {
    const { queryParams, filter } = model;
    const { formData, formMode, isComponentDisabled, setFormDataAndInstance } = useForm();
    const { globalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const dataSourceUrl = model.dataSourceUrl
      ? replaceTags(model.dataSourceUrl, { data: formData })
      : model.dataSourceUrl;

    const disabled = isComponentDisabled(model);

    const evaluatedFilters = useMemo(() => {
      if (!filter) return '';

      const localFormData = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

      const _response = evaluateDynamicFilters(
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
        ]
      );
      //@ts-ignore everything is in place here
      if (_response.find(f => f?.unevaluatedExpressions?.length)) return '';

      return JSON.stringify(_response[0]?.expression) || '';
    }, [filter, formData, globalState]);

    const getQueryParams = (): IQueryParams => {
      const queryParamObj: IQueryParams = {};

      if (queryParams?.length) {
        queryParams?.forEach(({ param, value }) => {
          const valueAsString = value as string;
          if (param?.length && valueAsString.length) {
            queryParamObj[param] = /{.*}/i.test(valueAsString)
              ? evaluateValue(valueAsString, { data: formData })
              : value;
          }
        });
      }

      if (filter) queryParamObj['filter'] = typeof filter === 'string' ? filter : evaluatedFilters;
      // if (filter) queryParamObj['filter'] = typeof filter === 'string' ? filter : JSON.stringify(filter);

      return queryParamObj;
    };

    //console.log('LOGS:: filter, evaluatedFilters, getQueryParams(): ', filter, evaluatedFilters, getQueryParams());

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
      formData,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData: setFormDataAndInstance,
    };

    const autocompleteProps = {
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
      defaultValue: evaluateString(model.defaultValue, { formData, formMode, globalState }) as any,
      getOptionFromFetchedItem,
      disableSearch: model.disableSearch,
      filter: evaluatedFilters,
      quickviewEnabled: model.quickviewEnabled,
      quickviewFormPath: model.quickviewFormPath,
      quickviewDisplayPropertyName: model.quickviewDisplayPropertyName,
      quickviewGetEntityUrl: model.quickviewGetEntityUrl,
      quickviewWidth: model.quickviewWidth,
      subscribedEventNames: model.subscribedEventNames,
      style: getStyle(model.style, formData),
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
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IAutocompleteProps = {
      ...model,
      dataSourceType: 'entitiesList',
      useRawValues: false,
    };
    return customProps;
  },
  linkToModelMetadata: (model, metadata): IAutocompleteProps => {
    return {
      ...model,
      useRawValues: true,
      dataSourceType: 'entitiesList',
      entityTypeShortAlias: metadata.entityType,
      mode: undefined,
    };
  },
};

export default AutocompleteComponent;
