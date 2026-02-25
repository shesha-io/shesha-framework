import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { DataTypes } from '@/interfaces/dataTypes';
import { IComponentValidationRules, IInputStyles, useMetadata } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { INumberFieldComponentProps, NumberFieldComponentDefinition } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
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

const suffixStyle = { color: 'rgba(0,0,0,.45)' };

const NumberFieldComponent: NumberFieldComponentDefinition = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  calculateModel: (model, allData) => {
    return {
      eventHandlers: { ...getEventHandlers(model, allData), ...customOnChangeValueEventHandler(model, allData) },
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles({
      fontFamily: model?.font?.type,
      fontWeight: model?.font?.weight,
      textAlign: model?.font?.align,
      color: model?.font?.color,
      fontSize: model?.font?.size,
      padding: {
        padding: model?.allStyles?.fullStyle?.padding,
        paddingLeft: model?.allStyles?.fullStyle?.paddingLeft,
        paddingRight: model?.allStyles?.fullStyle?.paddingRight,
        paddingTop: model?.allStyles?.fullStyle?.paddingTop,
        paddingBottom: model?.allStyles?.fullStyle?.paddingBottom,
      },
      hasSuffix: model?.suffix || model?.suffixIcon,
      hasPrefix: model?.prefix || model?.prefixIcon,
    });

    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    const inputProps: InputNumberProps = {
      disabled: model.readOnly,
      variant: model.hideBorder ? 'borderless' : undefined,
      min: model.validate?.minValue !== undefined ? model.validate?.minValue : null,
      max: model.validate?.maxValue !== undefined ? model.validate?.maxValue : Number.MAX_SAFE_INTEGER,
      placeholder: model?.placeholder,
      size: model?.size,
      step: model?.highPrecision ? model?.stepString : model?.stepNumeric,
      ...calculatedModel.eventHandlers,
      defaultValue: calculatedModel.defaultValue,
      changeOnWheel: false,
      prefix: <>{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={suffixStyle} />}{model.prefix}</>,
      suffix: <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon} style={suffixStyle} />}</>,
    };

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle;

    return (
      <ConfigurableFormItem model={model} initialValue={calculatedModel.defaultValue}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (val: number | string | null): void => {
            const newValue = val !== undefined && val !== null && model.highPrecision
              ? (typeof val === 'string' ? parseFloat(val) : val)
              : val;
            customEvents.onChange(newValue);
            onChange(newValue);
          };
          return model.readOnly
            ? <ReadOnlyDisplayFormItem type="number" value={getNumberFormat(value, getDataProperty(properties, model.propertyName, 'dataFormat'))} style={finalStyle} />
            : (
              <InputNumber
                type="number"
                value={value}
                {...inputProps}
                style={{ ...model.allStyles.fullStyle }}
                className={styles.numberField}
                onChange={onChangeInternal}
              />
            );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
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
      .add<INumberFieldComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
      .add<INumberFieldComponentProps>(6, (prev) => {
        const model = { ...migrateHiddenToVisible(prev) };
        if (prev.min !== undefined || prev.max !== undefined) {
          model.validate = prev.validate ?? {} as IComponentValidationRules;
          model.validate.minValue = prev.min;
          model.validate.maxValue = prev.max;
        }
        return model;
      }),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  linkToModelMetadata: (model, metadata): INumberFieldComponentProps => {
    return {
      ...model,
      editMode: undefined,
      label: '', // metadata.label,
      description: '', // metadata.description,
      validate: undefined,
      // min: metadata.min,
      // max: metadata.max,
      // TODO: add decimal points and format
    };
  },
};

export default NumberFieldComponent;
