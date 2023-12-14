import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import settingsFormJson from './settingsForm.json';
import React, { CSSProperties } from 'react';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { axiosHttp } from '@/utils/fetchers';
import moment from 'moment';
import { ITextAreaComponentProps } from './interfaces';
import { ConfigurableFormItem } from '@/components';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { customEventHandler } from '@/components/formDesigner/components/utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const settingsForm = settingsFormJson as FormMarkup;

interface IJsonTextAreaProps {
  value?: any;
  textAreaProps?: TextAreaProps;
  customEventHandler?: any;
}
const JsonTextArea: React.FC<IJsonTextAreaProps> = (props) => {
  const valuedString = !!props.value ? JSON.stringify(props.value, null, 2) : '';
  return (
    <Input.TextArea value={valuedString} rows={2} {...props.textAreaProps} disabled {...props.customEventHandler} />
  );
};

const TextAreaComponent: IToolboxComponent<ITextAreaComponentProps> = {
  type: 'textArea',
  name: 'Text Area',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <FontColorsOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.multiline,
  Factory: ({ model, form }) => {
    const { formMode, setFormData } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const getTextAreaStyle = (style: CSSProperties = {}) => ({ ...style, marginBottom: model?.showCount ? '16px' : 0 });

    const textAreaProps: TextAreaProps = {
      className: 'sha-text-area',
      placeholder: model.placeholder,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: model.showCount,
      maxLength: model.validate?.maxLength,
      allowClear: model.allowClear,
      bordered: !model.hideBorder,
      size: model?.size,
      style: getTextAreaStyle(getStyle(model?.style, formData)),
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
      setFormData,
      setGlobalState,
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model?.passEmptyStringByDefault && '') ||
          evaluateString(model?.initialValue, { formData, formMode, globalState })
        }
      >
        {(value, onChange) => {
          const showAsJson = Boolean(value) && typeof value === 'object';

          const customEvent = customEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function') onChange(...args);
          };

          return showAsJson ? (
            <JsonTextArea value={value} textAreaProps={textAreaProps} customEventHandler={customEvent} />
          ) : model.readOnly ? (
            <ReadOnlyDisplayFormItem value={value} />
          ) : (
            <Input.TextArea
              rows={2}
              {...textAreaProps}
              disabled={model.readOnly}
              {...customEvent}
              value={value}
              onChange={onChangeInternal}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const textAreaModel: ITextAreaComponentProps = {
      ...model,
      label: 'Text Area',
      autoSize: false,
      showCount: false,
      allowClear: false,
    };

    return textAreaModel;
  },
  migrator: (m) =>
    m
      .add<ITextAreaComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITextAreaComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ITextAreaComponentProps>(2, (prev) => migrateReadOnly(prev))
    ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default TextAreaComponent;
