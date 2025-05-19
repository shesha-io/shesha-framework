import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useMetadata } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getEventHandlers, customOnChangeValueEventHandler } from '@/components/formDesigner/components/utils';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { InputNumber, InputNumberProps } from 'antd';
import { ShaIcon } from '@/components';

const settingsForm = settingsFormJson as unknown as FormMarkup;
const suffixStyle = { color: 'rgba(0,0,0,.45)' };

interface INumberFieldComponentCalulatedValues {
  defaultValue?: string;
  eventHandlers?: any;
}

const NumberFieldComponent: IToolboxComponent<INumberFieldComponentProps, INumberFieldComponentCalulatedValues> = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  calculateModel: (model, allData) => {
    return {
      defaultValue: model?.defaultValue 
        ? evaluateString(model?.defaultValue, { formData: allData.data, formMode: allData.form.formMode, globalState: allData.globalState }) 
        : undefined,
      eventHandlers: {...getEventHandlers(model, allData), ...customOnChangeValueEventHandler(model, allData)},
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles({
      fontFamily: model?.font?.type,
      fontWeight: model?.font?.weight,
      textAlign: model?.font?.align,
      color: model?.font?.color,
      fontSize: model?.font?.size,
    });

    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    const inputProps: InputNumberProps = {
      className: 'sha-number-field',
      disabled: model.readOnly,
      variant: model.hideBorder ? 'borderless' : undefined,
      min: model?.validate?.minValue ?? 0,
      max: model?.validate?.maxValue ?? Number.MAX_SAFE_INTEGER,
      placeholder: model?.placeholder,
      size: model?.size,
      style: model.style ? model.allStyles.jsStyle : { width: '100%' },
      step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
      ...calculatedModel.eventHandlers,
      defaultValue: calculatedModel.defaultValue,
      changeOnWheel: false,
      prefix: <>{model.prefix}{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={suffixStyle} />}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon} style={suffixStyle} />}</>,
    };

    return (
      <ConfigurableFormItem model={model} initialValue={calculatedModel.defaultValue}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (...args: any[]) => {
            customEvents.onChange(args[0]);
            onChange(...args);
          };
          return model.readOnly 
            ? <ReadOnlyDisplayFormItem type="number" value={getNumberFormat(value, getDataProperty(properties, model.propertyName))} /> 
            : <InputNumber
              value={value ?? model?.defaultValue}
              {...inputProps}
              stringMode={!model?.highPrecision}
              style={model.allStyles.fullStyle}
              className={`sha-input ${styles.numberField}`}
              onChange={onChangeInternal}
            />
          ;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  initModel: (model) => ({
    ...model,
  }),
  migrator: (m) =>
    m
      .add<INumberFieldComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<INumberFieldComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<INumberFieldComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<INumberFieldComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<INumberFieldComponentProps>(4, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          hideBorder: prev.hideBorder,
          stylingBox: prev.stylingBox,
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<INumberFieldComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),

  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model, metadata): INumberFieldComponentProps => {
    return {
      ...model,
      label: metadata.label,
      description: metadata.description,
      min: metadata.min,
      max: metadata.max,
      // TODO: add decimal points and format
    };
  },
};

export default NumberFieldComponent;
