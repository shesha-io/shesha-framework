import { CodeOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input';
import React, { useMemo } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ITextFieldComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IconType, ShaIcon } from '@/components';
import { useStyles } from './styles';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

interface ITextFieldComponentCalulatedValues {
  defaultValue?: string;
  eventHandlers?: IEventHandlers;
}

const TextFieldComponent: IToolboxComponent<ITextFieldComponentProps, ITextFieldComponentCalulatedValues> = {
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
  calculateModel: (model, allData) => {
    return {
      defaultValue: model.initialValue 
        ? evaluateString(model.initialValue, { formData: allData.data, formMode: allData.form.formMode, globalState: allData.globalState }) 
        : undefined,
      eventHandlers: getAllEventHandlers(model, allData)
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles({ fontFamily: model?.font?.type, fontWeight: model?.font?.weight, textAlign: model?.font?.align, color: model?.font?.color, fontSize: model?.font?.size });
    const InputComponentType = useMemo(() => model.textType === 'password' ? Input.Password : Input, [model.textType]);

    if (model.hidden) return null;

    const inputProps: InputProps = {
      className: `sha-input ${styles.textField}`,
      placeholder: model.placeholder,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon as IconType} style={{ color: 'rgba(0,0,0,.45)' }} />}</>,
      variant: model?.border?.hideBorder ? 'borderless' : undefined,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      spellCheck: model.spellCheck,
      style: model.allStyles.fullStyle,
      defaultValue: calculatedModel.defaultValue,
      maxLength: model.validate?.maxLength,
      max: model.validate?.maxLength,
      minLength: model.validate?.minLength,
    };

    return (
      <ConfigurableFormItem model={model} initialValue={calculatedModel.defaultValue} >
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (...args: any[]) => {
            customEvents.onChange({value: args[0].currentTarget.value}, args[0]);
            if (typeof onChange === 'function') onChange(...args);
          };

          return inputProps.readOnly
              ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value?.length, '•') : value} disabled={model.readOnly} />
              : <InputComponentType {...inputProps} {...customEvents} disabled={model.readOnly} value={value} onChange={onChangeInternal} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
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