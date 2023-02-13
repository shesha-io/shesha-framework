import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { DownSquareOutlined } from '@ant-design/icons';
import { message, Select } from 'antd';
import ConfigurableFormItem from '../formItem';
import { IDropdownProps, ILabelValue } from './models';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import RefListDropDown from '../../../refListDropDown';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { evaluateString, useForm, useGlobalState, useSheshaApplication } from '../../../..';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { customDropDownEventHandler } from '../utils';
import { axiosHttp } from '../../../../apis/axios';
import moment from 'moment';
import { getLegacyReferenceListIdentifier } from '../../../../utils/referenceList';

const settingsForm = settingsFormJson as FormMarkup;

const DropdownComponent: IToolboxComponent<IDropdownProps> = {
  type: 'dropdown',
  name: 'Dropdown',
  icon: <DownSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  factory: (model: IDropdownProps, _c, form) => {
    const { formData, formMode, setFormDataAndInstance } = useForm();
    const { globalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

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

    return (
      <ConfigurableFormItem model={model}>
        <Dropdown {...model} {...customDropDownEventHandler(eventProps)} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m =>
    m
      .add<IDropdownProps>(0, prev => ({
        ...prev,
        dataSourceType: prev['dataSourceType'] ?? 'values',
        useRawValues: prev['useRawValues'] ?? false,
      }))
      .add<IDropdownProps>(1, prev => {
        return {
          ...prev,
          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
        };
      }),
  linkToModelMetadata: (model, metadata): IDropdownProps => {
    return {
      ...model,
      dataSourceType: metadata.dataType === DataTypes.referenceListItem ? 'referenceList' : 'values',
      referenceListId: {
        module: metadata.referenceListModule,
        name: metadata.referenceListName,
      },
      mode: 'single',
      useRawValues: true,
    };
  },
};

export const Dropdown: FC<IDropdownProps> = ({
  id,
  dataSourceType,
  values,
  onChange,
  value: val,
  hideBorder,
  disabled,
  referenceListId,
  mode,
  defaultValue: defaultVal,
  ignoredValues = [],
  placeholder,
  useRawValues,
  readOnly,
  isDynamic,
  style,
  size,
  allowClear = true,
}) => {
  const { formMode, isComponentDisabled, formData } = useForm();
  const { globalState } = useGlobalState();

  const getOptions = (): ILabelValue[] => {
    return value && typeof value === 'number' ? values?.map(i => ({ ...i, value: parseInt(i.value) })) : values;
  };

  const selectedMode = mode === 'single' ? undefined : mode;

  const isReadOnly = formMode === 'readonly' || readOnly;

  const isDisabled = isComponentDisabled({ id, isDynamic, disabled });

  const localStyle = getStyle(style, formData);

  //quick fix not to default to empty string or null while working with multi-mode
  const defaultValue = evaluateString(defaultVal, { formData, formMode, globalState }) || undefined;

  const value = (evaluateString(val, { formData, formMode, globalState }) || undefined) as any;

  if (dataSourceType === 'referenceList') {
    return useRawValues ? (
      <RefListDropDown.Raw
        onChange={onChange}
        referenceListId={referenceListId}
        disabled={isDisabled}
        value={value}
        bordered={!hideBorder}
        defaultValue={defaultValue}
        mode={selectedMode}
        filters={ignoredValues}
        includeFilters={false}
        placeholder={placeholder}
        readOnly={isReadOnly}
        size={size}
        style={localStyle}
        allowClear={allowClear}
      />
    ) : (
      <RefListDropDown.Dto
        onChange={onChange}
        referenceListId={referenceListId}
        disabled={isDisabled}
        value={value}
        bordered={!hideBorder}
        defaultValue={defaultValue}
        mode={selectedMode}
        filters={ignoredValues}
        includeFilters={false}
        placeholder={placeholder}
        readOnly={isReadOnly}
        size={size}
        style={localStyle}
        allowClear={allowClear}
      />
    );
  }

  const options = getOptions() || [];

  const selectedValue = options.length > 0 ? value || defaultValue : null;

  const getSelectValue = () => {
    return options?.find(({ value: currentValue }) => currentValue === selectedValue)?.label;
  };

  if (isReadOnly) {
    return <ReadOnlyDisplayFormItem disabled={isDisabled} type="string" value={getSelectValue()} />;
  }

  return (
    <Select
      allowClear={allowClear}
      onChange={onChange}
      value={options.length > 0 ? value || defaultValue : undefined}
      defaultValue={defaultValue}
      bordered={!hideBorder}
      disabled={isDisabled}
      mode={selectedMode}
      placeholder={placeholder}
      showSearch
      size={size}
    >
      {options.map((option, index) => (
        <Select.Option key={index} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default DropdownComponent;
