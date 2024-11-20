import { CodeOutlined } from '@ant-design/icons';
import { ConfigProvider, Input, App } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { FormMarkup, useForm, useGlobalState, useHttpClient, useSheshaApplication } from '@/providers';
import { evaluateString, getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IInputStyles, ITextFieldComponentProps, TextType } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon, ValidationErrors } from '@/components';
import { removeUndefinedProps } from '@/utils/object';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import settingsFormJson from './settingsForm.json';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { useStyles } from './styles';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';

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

    const data = model;

    const { globalState, setState: setGlobalState } = useGlobalState();
    const httpClient = useHttpClient();
    const { message } = App.useApp();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const { styles } = useStyles({ fontFamily: model?.font?.type, fontWeight: model?.font?.weight, textAlign: model?.font?.align });
    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {

      const fetchStyles = async () => {

        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
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

    const jsStyle = getStyle(model.style, data);
    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight.split(' - ')[0]) || 400 });
    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: `sha-input ${styles.textField}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model?.border?.hideBorder ? 'borderless' : undefined,
      maxLength: model.validate?.maxLength,
      minLength: model.validate?.minLength,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: { ...finalStyle, ...jsStyle },
      defaultValue: model.initialValue && evaluateString(model.initialValue, { formData: data, formMode: form.formMode, globalState })
    };

    const eventProps = {
      model,
      form: getFormApi(form),
      formData: data,
      globalState,
      http: httpClient,
      message,
      moment,
      setGlobalState,
    };

    console.log("TextFieldComponent -> eventProps", model);

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model.initialValue ? evaluateString(model.initialValue, { formData: data, formMode: form.formMode, globalState }) : undefined)
        }
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
                  fontFamily: model?.font?.type,
                  fontSize: model?.font?.size || 14,
                  fontWeightStrong: Number(model?.font?.weight.split(' - ')[0]) || 400,
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => ({
    ...model,
    textType: 'password'
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
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<ITextFieldComponentProps>(6, (prev) => ({ ...migratePrevStyles(prev) })),
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;