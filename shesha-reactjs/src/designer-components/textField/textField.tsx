import { CodeOutlined } from '@ant-design/icons';
import { Input, App } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React, { CSSProperties } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { ITextFieldComponentProps, IInputStyles, TextType } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon } from '@/components';
import { toSizeCssProp } from '@/utils/form';
import { removeUndefinedProps } from '@/utils/object';

const settingsForm = settingsFormJson as FormMarkup;

const renderInput = (type: TextType) => {
  switch (type) {
    case 'password':
      return Input.Password;
    default:
      return Input;
  }
};

const TextFieldComponent: IToolboxComponent<ITextFieldComponentProps> = {
  type: 'textField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Text field',
  icon: <CodeOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string &&
    (dataFormat === StringFormats.singleline ||
      dataFormat === StringFormats.emailAddress ||
      dataFormat === StringFormats.phoneNumber ||
      dataFormat === StringFormats.password),
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
    const finalStyle = removeUndefinedProps({ ...jsStyle, ...additionalStyles });

    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: 'sha-input',
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model.hideBorder ? 'borderless' : undefined,
      maxLength: model.validate?.maxLength,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: finalStyle,
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
          (model.passEmptyStringByDefault && '') ||
          (model.initialValue ? evaluateString(model.initialValue, { formData, formMode: form.formMode, globalState }) : undefined)
        }
      >
        {(value, onChange) => {
          const customEvent = customEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function')
              onChange(...args);
          };
          return inputProps.readOnly
            ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value?.length, '•') : value} disabled={model.readOnly} />
            : <InputComponentType {...inputProps} {...customEvent} disabled={model.readOnly} value={value} onChange={onChangeInternal} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => ({
    textType: 'text',
    ...model,
  }),
  migrator: (m) => m
    .add<ITextFieldComponentProps>(0, (prev) => ({ ...prev, textType: 'text' }))
    .add<ITextFieldComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITextFieldComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<ITextFieldComponentProps>(3, (prev) => migrateReadOnly(prev))
    .add<ITextFieldComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<ITextFieldComponentProps>(5, (prev) => {
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
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;
