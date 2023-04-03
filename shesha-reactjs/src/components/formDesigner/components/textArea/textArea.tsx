import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import ConfigurableFormItem from '../formItem';
import { TextAreaProps } from 'antd/lib/input';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { DataTypes, StringFormats } from '../../../../interfaces/dataTypes';
import { customEventHandler } from '../utils';
import { axiosHttp } from '../../../../utils/fetchers';
import moment from 'moment';

export interface ITextAreaProps extends IConfigurableFormComponent {
  placeholder?: string;
  showCount?: boolean;
  autoSize?: boolean;
  allowClear?: boolean;
  hideBorder?: boolean;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

interface IJsonTextAreaProps {
  value?: any;
  textAreaProps?: TextAreaProps;
  customEventHandler?: any;
}
const JsonTextArea: React.FC<IJsonTextAreaProps> = props => {
  const valuedString = !!props.value ? JSON.stringify(props.value, null, 2) : '';
  return (
    <Input.TextArea value={valuedString} rows={2} {...props.textAreaProps} disabled {...props.customEventHandler} />
  );
};

const TextField: IToolboxComponent<ITextAreaProps> = {
  type: 'textArea',
  name: 'Text Area',
  icon: <FontColorsOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.multiline,
  factory: (model: ITextAreaProps, _c, form) => {
    const { formMode, isComponentDisabled, setFormDataAndInstance } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const textAreaProps: TextAreaProps = {
      placeholder: model.placeholder,
      disabled: model.disabled,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: model.showCount,
      maxLength: model.validate?.maxLength,
      allowClear: model.allowClear,
      bordered: !model.hideBorder,
      size: model?.size,
      style: getStyle(model?.style, formData),
    };

    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

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
      setGlobalState,
    };

    const currentValue = form?.getFieldValue(model.name);
    const showAsJson = Boolean(currentValue) && typeof currentValue === 'object';

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model?.passEmptyStringByDefault && '') ||
          evaluateString(model?.initialValue, { formData, formMode, globalState })
        }
      >
        {showAsJson ? (
          <JsonTextArea textAreaProps={textAreaProps} customEventHandler={customEventHandler(eventProps)} />
        ) : isReadOnly ? (
          <ReadOnlyDisplayFormItem disabled={disabled} />
        ) : (
          <Input.TextArea rows={2} {...textAreaProps} disabled={disabled ? disabled : undefined} {...customEventHandler(eventProps)} />
        )}
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const textAreaModel: ITextAreaProps = {
      ...model,
      label: 'Text Area',
      autoSize: false,
      showCount: false,
      allowClear: false,
    };

    return textAreaModel;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default TextField;
