import { CodeOutlined } from '@ant-design/icons';
import { ConfigProvider, Input, message } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { FormMarkup, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { evaluateString, getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { ITextFieldComponentProps, TextType } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ShaIcon, ValidationErrors } from '@/components';
import { removeUndefinedProps } from '@/utils/object';
import { getSizeStyle } from '../styleDimensions/utils';
import { getBorderStyle } from '../styleBorder/utils';
import { getBackgroundStyle } from '../styleBackground/utils';
import settingsFormJson from './settingsForm.json';
import { useStyles } from './styles/styles';
import { getShadowStyle } from '../styleShadow/utils';
import { getFontStyle } from '../styleFont/utils';

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
    const { styles } = useStyles();

    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const { dimensions, border, font, shadow, background } = model?.styles || {};
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundStyle(background, backendUrl, httpHeaders).then((style) => {
          setBackgroundStyles(style);
        });
      };
      fetchStyles();
    }, [background, background?.gradient?.colors, background, backendUrl, httpHeaders]);

    if (model?.styles?.background?.type === 'storedFile' && model?.styles?.background.storedFile?.id && !isValidGuid(model.styles.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
    });

    const jsStyle = getStyle(model.style, formData);
    const finalStyle = removeUndefinedProps({ ...jsStyle, ...additionalStyles });

    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: `sha-input ${styles.textFieldInput}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model?.styles?.border?.hideBorder ? 'borderless' : undefined,
      maxLength: model.validate?.maxLength,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: { ...finalStyle },
      count: { max: model.validate?.maxLength, },
      autoComplete: model.textType === 'password' ? 'new-password' : undefined,
      defaultValue: model.initialValue && evaluateString(model.initialValue, { formData, formMode: form.formMode, globalState })
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
      >
        {(value, onChange) => {
          const customEvent = customEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function')
              onChange(...args);
          };

          return <ConfigProvider
            theme={{
              components: {
                Input: {
                  fontFamily: model.font?.type,
                  fontSize: model.font?.size || 14
                },
              },
            }}
          >
            {inputProps.readOnly
              ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value?.length, '•') : value} disabled={model.readOnly} />
              : <InputComponentType {...inputProps} {...customEvent} disabled={model.readOnly} value={value} onChange={onChangeInternal} />
            }
          </ConfigProvider>;
        }}
      </ConfigurableFormItem>
    );
  },
  // settingsFormFactory: (props) => (<TextFieldSettingsForm {...props} />),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  // settingsFormMarkup: settingFormMarkup,
  // validateSettings: (model) => validateConfigurableComponentSettings(settingFormMarkup, model),
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