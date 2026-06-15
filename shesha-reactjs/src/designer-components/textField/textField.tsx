import { CodeOutlined } from '@ant-design/icons';
import { Input, InputRef, Tooltip } from 'antd';
import { InputProps } from 'antd/lib/input';
import React, { useEffect, useMemo, useRef } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ITextFieldComponentProps, TextFieldComponentDefinition } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon } from '@/components/shaIcon';
import { useStyles } from './styles';
import { PasswordFieldWrapper } from './passwordFieldWrapper';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { defaultStyles, buildPasswordValidatorString, usePasswordComplexitySettings, validatePasswordValue } from './utils';
import { useComponentApi } from '@/providers/componentApi/provider';
import { TextFieldApi } from '@/componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const TextFieldComponent: TextFieldComponentDefinition = {
  type: 'textField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Text field',
  icon: <CodeOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string &&
    (!dataFormat ||
      dataFormat === StringFormats.singleline ||
      dataFormat === StringFormats.emailAddress ||
      dataFormat === StringFormats.phoneNumber ||
      dataFormat === StringFormats.password),
  calculateModel: (model, allData) => ({ eventHandlers: getAllEventHandlers(model, allData) }),
  Factory: ({ model, calculatedModel }) => {
    const componentApi = useComponentApi();
    const inputRef = useRef<InputRef>(null);
    useEffect(() => {
      componentApi?.updateApi<TextFieldApi>({
        id: model.id,
        componentName: model.componentName,
        level: 3,
        typeDefinition: { typeName: 'TextFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles({ fontFamily: model.font?.type, fontWeight: model.font?.weight, textAlign: model.font?.align, color: model.font?.color, fontSize: model.font?.size });
    const InputComponentType = useMemo(() => model.textType === 'password' ? Input.Password : Input, [model.textType]);

    const finalStyle = useMemo(() => !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle, [model.enableStyleOnReadonly, model.readOnly, model.allStyles]);

    const regExpObj = useMemo(() => {
      if (!model.regExp) return null;
      try {
        return new RegExp(model.regExp, 'g');
      } catch (error) {
        console.warn(`Invalid regExp pattern for '${model.propertyName}':`, model, error);
        return null;
      }
    }, [model]);

    const isPassword = model.textType === 'password';
    const passwordComplexity = usePasswordComplexitySettings();

    const passwordValidator = useMemo(() =>
      isPassword && model.useStandardPasswordValidation ? buildPasswordValidatorString(passwordComplexity) : null,
    [isPassword, model.useStandardPasswordValidation, passwordComplexity],
    );

    const modelWithValidation = useMemo(() => {
      if (!isPassword || !passwordValidator || model.validate?.validator) return model;
      return {
        ...model,
        validate: {
          ...(model.validate || {}),
          minLength: undefined,
          maxLength: undefined,
          validator: passwordValidator,
        },
      };
    }, [model, isPassword, passwordValidator]);

    if (model.hidden) return null;

    const inputProps: InputProps = {
      className: `sha-input ${styles.textField}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model.border?.hideBorder ? 'borderless' : undefined,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      spellCheck: model.spellCheck ?? false,
      style: model.allStyles.fullStyle,
    };

    const fieldContent = (
      <ConfigurableFormItem model={modelWithValidation}>
        {(value, onChange) => {
          // Derive password tooltip error from committed value so it stays in sync with
          // the form validator (handles initial values, programmatic changes, and resets).
          // Only active when the complexity validator is actually composed into the model
          // (i.e. no custom validator has overridden it).
          const isPasswordComplexityActive = isPassword && model.useStandardPasswordValidation && !!passwordValidator && !model.validate?.validator;
          const passwordError = isPasswordComplexityActive && value
            ? (() => {
              const errors = validatePasswordValue(value as string, passwordComplexity);
              return errors.length > 0 ? `Password must contain ${errors.join(', ')}` : null;
            })()
            : null;

          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (...args: unknown[]): void => {
            const arg = args[0];
            const inputValue: string | undefined =
              arg !== null && typeof arg === 'object' && 'currentTarget' in arg &&
              arg.currentTarget !== null && typeof arg.currentTarget === 'object' && 'value' in arg.currentTarget
                ? arg.currentTarget.value?.toString()
                : undefined;
            const isEmpty = inputValue === undefined || inputValue === null || inputValue === '';

            const isRegExpMatch = regExpObj && Boolean(inputValue?.match(regExpObj));

            let val = inputValue;
            if ((!isEmpty && isRegExpMatch) || !regExpObj || isEmpty) {
              const changedValue = customEvents.onChange({ value: inputValue }, args[0]) as string | undefined;
              val = changedValue !== undefined ? changedValue : inputValue;
            } else {
              // Workaround because if the value is undefined, input component leave the inputed value
              // Rendering of the component is not called
              // And there is a discrepancy - the value is undefined, but the some text is displayed in the component
              if (Boolean(regExpObj) && value === undefined && typeof onChange === 'function') {
                onChange('');
              }
              return;
            }
            if (typeof onChange === 'function') onChange(val);
          };

          const inputElement = inputProps.readOnly
            ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value?.length, '•') : value} style={finalStyle} />
            : <InputComponentType ref={inputRef} {...inputProps} {...customEvents} disabled={model.readOnly} value={value} onChange={onChangeInternal} />;

          if (isPassword) {
            return (
              <Tooltip title={passwordError ?? undefined} placement="bottom">
                {inputElement}
              </Tooltip>
            );
          }

          return inputElement;
        }}
      </ConfigurableFormItem>
    );

    if (isPassword) {
      return <PasswordFieldWrapper className={styles.passwordFieldWrapper}>{fieldContent}</PasswordFieldWrapper>;
    }

    return fieldContent;
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => ({ ...model, textType: 'text' }),
  migrator: (m) => m
    .add<ITextFieldComponentProps>(0, (prev) => ({ ...prev, textType: 'text' }))
    .add<ITextFieldComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITextFieldComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<ITextFieldComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
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
    .add<ITextFieldComponentProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => (
    { ...model, textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text' }
  ),
};

export default TextFieldComponent;
