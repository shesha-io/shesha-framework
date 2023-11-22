import { DownSquareOutlined } from '@ant-design/icons';
import { message, Select } from 'antd';
import moment from 'moment';
import React, { FC } from 'react';
import { evaluateString } from '../..';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { customDropDownEventHandler } from 'components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from 'components/readOnlyDisplayFormItem';
import RefListDropDown from 'components/refListDropDown';
import { IToolboxComponent } from 'interfaces';
import { DataTypes } from 'interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from 'providers';
import { FormMarkup } from 'providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from 'providers/form/utils';
import { axiosHttp } from 'utils/fetchers';
import { getLegacyReferenceListIdentifier } from 'utils/referenceList';
import { IDropdownComponentProps, ILabelValue } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

const settingsForm = settingsFormJson as FormMarkup;

const DropdownComponent: IToolboxComponent<IDropdownComponentProps> = {
  type: 'dropdown',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Dropdown',
  icon: <DownSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  Factory: ({ model, form }) => {
    const { formMode, setFormData } = useForm();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const { data: formData } = useFormData();
    const eventProps = {
      model,
      form,
      formData,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData,
      setGlobalState,
    };

    const initialValue = model?.defaultValue ? { initialValue: model.defaultValue } : {};


    return (
      <ConfigurableFormItem model={model} {...initialValue}>
        {(value, onChange) => {
          const customEvent =  customDropDownEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function') 
              onChange(...args);
          };
          
          return <Dropdown {...model} {...customEvent} value={value} onChange={onChangeInternal} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IDropdownComponentProps>(0, (prev) => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      useRawValues: prev['useRawValues'] ?? false,
    }))
    .add<IDropdownComponentProps>(1, (prev) => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
      };
    })
    .add<IDropdownComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDropdownComponentProps>(3, (prev) => migrateVisibility(prev))
  ,
  linkToModelMetadata: (model, metadata): IDropdownComponentProps => {
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

export const Dropdown: FC<IDropdownComponentProps> = ({
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
  style,
  size,
  allowClear = true,
}) => {
  const { formMode } = useForm();
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();

  const getOptions = (): ILabelValue[] => {
    return value && typeof value === 'number' ? values?.map((i) => ({ ...i, value: parseInt(i.value, 10) })) : values;
  };

  const selectedMode = mode === 'single' ? undefined : mode;

  const localStyle = getStyle(style, formData);

  //quick fix not to default to empty string or null while working with multi-mode
  const defaultValue = evaluateString(defaultVal, { formData, formMode, globalState }) || undefined;

  const value = (evaluateString(val, { formData, formMode, globalState }) || undefined) as any;

  if (dataSourceType === 'referenceList') {
    return useRawValues ? (
      <RefListDropDown.Raw
        onChange={onChange}
        referenceListId={referenceListId}
        disabled={disabled}
        value={value}
        bordered={!hideBorder}
        defaultValue={defaultValue}
        mode={selectedMode}
        filters={ignoredValues}
        includeFilters={false}
        placeholder={placeholder}
        readOnly={readOnly}
        size={size}
        style={localStyle}
        allowClear={allowClear}
      />
    ) : (
      <RefListDropDown.Dto
        onChange={onChange}
        referenceListId={referenceListId}
        disabled={disabled}
        value={value}
        bordered={!hideBorder}
        defaultValue={defaultValue}
        mode={selectedMode}
        filters={ignoredValues}
        includeFilters={false}
        placeholder={placeholder}
        readOnly={readOnly}
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

  if (readOnly) {
    return <ReadOnlyDisplayFormItem disabled={disabled} type="string" value={getSelectValue()} />;
  }

  return (
    <Select
      allowClear={allowClear}
      onChange={onChange}
      value={options.length > 0 ? value || defaultValue : undefined}
      defaultValue={defaultValue}
      bordered={!hideBorder}
      disabled={disabled}
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
