import { CodeOutlined } from '@ant-design/icons';
import { ConfigProvider, Input, message } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { evaluateString, getStyle } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { ITextFieldComponentProps, TextType } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon, ValidationErrors } from '@/components';
import { TextFieldSettingsForm } from './settings';
import { getSizeStyle } from '../styleDimensions/components/size/utils';
import { getBorderStyle } from '../styleBorder/components/border/utils';
import { getBackgroundStyle } from '../styleBackground/components/background/utils';
import { getFontStyle } from '../styleFont/components/font/utils';
import { useStyles } from './styles/styles';

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
    const { styles } = useStyles();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const sizeStyles = useMemo(() => getSizeStyle(model?.dimensions), [model.dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(model?.border), [model.border]);
    const fontStyles = useMemo(() => getFontStyle(model.font), [model.font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundStyle(model?.background).then((style) => {
          setBackgroundStyles(style);
        });
      };
      fetchStyles();
    }, [model.background]);

    if (model?.background?.type === 'storedFile' && model.background.storedFile?.id && !isValidGuid(model.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }
    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: `sha-input ${styles.textFieldInput}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model.hideBorder ? 'borderless' : undefined,
      maxLength: model.validate?.maxLength,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: { ...getStyle(model?.style, formData), ...sizeStyles, ...borderStyles, ...backgroundStyles, ...fontStyles },
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
            ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value.length, '•') : value} disabled={model.readOnly} />
            :
            <ConfigProvider
              theme={{
                token: {
                  fontFamily: model.font?.type || 'Arial',
                  fontSize: Number(model.font?.size?.value) || 14,
                  lineHeight: Number(model.font?.lineHeight?.value) || 1.5,
                },
              }}
            >
              <InputComponentType {...inputProps} {...customEvent} disabled={model.readOnly} value={value} onChange={onChangeInternal} />
            </ConfigProvider>;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: (props) => (<TextFieldSettingsForm {...props} />),
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
  ,
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;
