import { CodeOutlined } from '@ant-design/icons';
import { Input, InputRef, Tooltip } from 'antd';
import { InputProps } from 'antd/lib/input';
import { useEffect, useMemo, useRef } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IInputStyles, UnwrapCodeEvaluators } from '@/providers';

import { ITextFieldComponentProps, TextFieldComponentDefinition, TextType } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly, migrateHiddenToVisible, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon } from '@/components/shaIcon';
import { useStyles } from './styles';
import { PasswordFieldWrapper } from './passwordFieldWrapper';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getSettings } from './settingsForm';
import { applyGroupFormatting, buildFormatValidatorString, defaultStyles, buildPasswordValidatorString, parseGroupLengths, stripSeparator, TEXT_TYPE_FORMATS, totalGroupLength, usePasswordComplexitySettings, validatePasswordValue } from './utils';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { TextFieldApi } from '@/componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const DATA_FORMAT_TO_TEXT_TYPE: Partial<Record<string, TextType>> = {
  [StringFormats.password]: 'password',
  [StringFormats.emailAddress]: 'email',
  [StringFormats.phoneNumber]: 'phone',
  [StringFormats.url]: 'url',
};

const TextFieldComponent: TextFieldComponentDefinition = {
  allowInherit: true,
  type: 'textField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Text field',
  icon: <CodeOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string &&
    (isNullOrWhiteSpace(dataFormat) ||
      dataFormat === StringFormats.singleline ||
      dataFormat === StringFormats.emailAddress ||
      dataFormat === StringFormats.phoneNumber ||
      dataFormat === StringFormats.url ||
      dataFormat === StringFormats.password),
  Factory: ({ model }) => {
    const componentApi = useComponentApiProvider();
    const inputRef = useRef<InputRef>(null);
    useEffect(() => {
      componentApi?.updateApi<TextFieldApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'TextFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);
    const InputComponentType = useMemo(() => model.textType === 'password' ? Input.Password : Input, [model.textType]);

    const regExpObj = useMemo(() => {
      if (model.textType !== 'text' || isNullOrWhiteSpace(model.regExp)) return null;
      try {
        return new RegExp(model.regExp, 'g');
      } catch (error) {
        console.warn(`Invalid regExp pattern for '${model.propertyName}':`, model, error);
        return null;
      }
    }, [model]);

    const isPassword = model.textType === 'password';
    const passwordComplexity = usePasswordComplexitySettings();
    const formatConfig = isDefined(model.textType) ? TEXT_TYPE_FORMATS[model.textType] : undefined;

    // Auto-format is only configurable for the 'text' type, so ignore any leftover
    // formatting settings when the type has been switched to email/url/phone/password.
    const formatGroupLengths = useMemo(
      () => model.textType === 'text' && model.enableFormatting === true ? parseGroupLengths(model.formatGroups) : [],
      [model.textType, model.enableFormatting, model.formatGroups],
    );
    const formatSeparator = model.formatSeparator ?? '-';

    const passwordValidator = useMemo(() =>
      isPassword && model.useStandardPasswordValidation === true ? buildPasswordValidatorString(passwordComplexity) : null,
    [isPassword, model.useStandardPasswordValidation, passwordComplexity],
    );

    const builtInValidator = isDefined(formatConfig)
      ? buildFormatValidatorString(formatConfig.pattern, formatConfig.message)
      : passwordValidator;

    const modelWithValidation = useMemo<UnwrapCodeEvaluators<ITextFieldComponentProps>>(() => {
      if (isNullOrWhiteSpace(builtInValidator) || isNotNullOrWhiteSpace(model.validate?.validator)) return model;
      return {
        ...model,
        validate: {
          ...(model.validate || {}),
          minLength: undefined,
          maxLength: undefined,
          validator: builtInValidator,
        },
      };
    }, [model, builtInValidator]);

    const inputProps: InputProps = {
      className: `sha-input ${styles.textField}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      size: model.size,
      disabled: model.disabled === true,
      spellCheck: model.spellCheck ?? false,
      ...(isDefined(model.styleCss) ? { style: model.styleCss } : {}),
      ...(isDefined(formatConfig) ? { type: formatConfig.inputType, autoComplete: formatConfig.autoComplete } : {}),
    };
    if (model.border?.hideBorder === true)
      inputProps.variant = 'borderless';

    const fieldContent = (
      <ConfigurableFormItem<string> model={modelWithValidation}>
        {(value, onChange, _, ctx) => {
          // Derive password tooltip error from committed value so it stays in sync with
          // the form validator (handles initial values, programmatic changes, and resets).
          // Only active when the complexity validator is actually composed into the model
          // (i.e. no custom validator has overridden it).
          const isPasswordComplexityActive = isPassword && model.useStandardPasswordValidation === true && isNotNullOrWhiteSpace(passwordValidator) && isNullOrWhiteSpace(model.validate?.validator);
          const passwordError = isPasswordComplexityActive && isNotNullOrWhiteSpace(value)
            ? (() => {
              const errors = validatePasswordValue(value, passwordComplexity);
              return errors.length > 0 ? `Password must contain ${errors.join(', ')}` : null;
            })()
            : null;

          const displayValue = formatGroupLengths.length > 0
            ? applyGroupFormatting(value ?? "", formatGroupLengths, formatSeparator)
            : (value ?? "");

          const inputElement = model.readOnly === true
            ? (
              <ReadOnlyDisplayFormItem
                value={model.textType === 'password' && !isNullOrWhiteSpace(value) ? ''.padStart(value.length, '•') : displayValue}
                enableFullStyle={model.enableStyleOnReadonly}
                style={model.styleCss}
                styleValue={model}
              />
            )
            : (
              <InputComponentType
                ref={inputRef}
                {...inputProps}
                value={displayValue}
                onChange={(event) => {
                  const inputValue = formatGroupLengths.length > 0
                    ? stripSeparator(event.currentTarget.value, formatSeparator).slice(0, totalGroupLength(formatGroupLengths))
                    : event.currentTarget.value;
                  const isEmpty = isNullOrWhiteSpace(inputValue);
                  const isRegExpMatch = isDefined(regExpObj) && inputValue.match(regExpObj) !== null;
                  if ((!isEmpty && isRegExpMatch) || !isDefined(regExpObj) || isEmpty) {
                    const changedValue = ctx?.handleEvent(event, { value: inputValue }, model.onChangeCustom);

                    onChange(changedValue !== undefined ? changedValue : inputValue);
                  } else {
                    // Workaround because if the value is undefined, input component leave the inputed value
                    // Rendering of the component is not called
                    // And there is a discrepancy - the value is undefined, but the some text is displayed in the component
                    if (isDefined(regExpObj) && value === undefined) {
                      onChange('');
                    }
                  }
                }}
                {...getComponentEvents<string>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.string)}
              />
            );

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

  initModel: (model) => ({ ...model, textType: 'text' }),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) => m
    .add<ITextFieldComponentProps>(0, (prev) => ({ ...prev, textType: 'text' }))
    .add<ITextFieldComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITextFieldComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<ITextFieldComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
    .add<ITextFieldComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<ITextFieldComponentProps>(5, (prev, context) => {
      if (context.isNew === true) return prev;

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
    .add<ITextFieldComponentProps>(6, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<ITextFieldComponentProps>(7, (prev) => migrateHiddenToVisible(migrateStylingBoxToJson(prev)))
    .add<ITextFieldComponentProps>(8, (prev) => migratePermissionsToVisiblePermissions(prev)),
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => (
    { ...model, textType: DATA_FORMAT_TO_TEXT_TYPE[metadata.dataFormat ?? ''] ?? 'text' }
  ),
  previewConfiguration: {
    type: 'textField',
    id: 'textField',
    propertyName: `textFieldAppearance`,
    label: `Text Field Label`,
    prefix: 'Prefix',
    prefixIcon: 'DoubleRightOutlined',
    suffixIcon: 'DoubleLeftOutlined',
    suffix: 'Suffix',
    version: 'latest',
    textType: 'text',
  },
};

export default TextFieldComponent;
