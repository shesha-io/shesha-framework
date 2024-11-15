import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FontColorsOutlined } from '@ant-design/icons';
import { Input, App } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import settingsFormJson from './settingsForm.json';
import React, { CSSProperties } from 'react';
import { evaluateString, getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
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
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { toSizeCssProp } from '@/utils/form';
import { removeUndefinedProps } from '@/utils/object';
import { IInputStyles } from '../textField/interfaces';

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
  Factory: ({ model }) => {
    const form = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const { message } = App.useApp();

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      height: toSizeCssProp(model.height),
      width: toSizeCssProp(model.width),
      borderWidth: model.hideBorder ? 0 : model.borderSize,
      borderRadius: model.borderRadius,
      borderStyle: model.borderType,
      borderColor: model.borderColor,
      backgroundColor: model.backgroundColor,
      color: model.fontColor,
      fontWeight: model.fontWeight,
      fontSize: model.fontSize,
      ...stylingBoxAsCSS,
    });
    const jsStyle = getStyle(model.style, formData);
    const finalStyle = removeUndefinedProps({...jsStyle, ...additionalStyles});

    const textAreaProps: TextAreaProps = {
      className: 'sha-text-area',
      placeholder: model.placeholder,
      autoSize: model.autoSize ? { minRows: 2 } : false,
      showCount: model.showCount,
      maxLength: model.validate?.maxLength,
      allowClear: model.allowClear,
      variant: model.hideBorder ? 'borderless' : undefined,
      size: model?.size,
      style: { ...finalStyle, marginBottom: model?.showCount ? '16px' : 0 },
    };

    const eventProps = {
      model,
      form: getFormApi(form),
      formData,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setGlobalState,
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model?.passEmptyStringByDefault && '') ||
          (model.initialValue ? evaluateString(model?.initialValue, { formData, formMode: form.formMode, globalState }) : undefined)
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
      .add<ITextAreaComponentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
      .add<ITextAreaComponentProps>(4, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          width: prev.width,
          height: prev.height,
          hideBorder: prev.hideBorder,
          borderSize: prev.borderSize,
          borderRadius: prev.borderRadius,
          borderColor: prev.borderColor,
          fontSize: prev.fontSize,
          fontColor: prev.fontColor,
          backgroundColor: prev.backgroundColor,
          stylingBox: prev.stylingBox,
          style: prev.style,
        };
        return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
      })
    ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default TextAreaComponent;