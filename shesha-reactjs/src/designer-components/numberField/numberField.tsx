import { NumberOutlined } from '@ant-design/icons';
import React, { useMemo, useState } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { DataTypes, NumberFormats } from '@/interfaces/dataTypes';
import { IComponentValidationRules, IInputStyles, useMetadata } from '@/providers';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { INumberFieldComponentProps, INumberFieldComponentPropsV1, NumberFieldComponentDefinition } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray, IDecimalFormatting, INumberFormatting, isDecimalFormatting, isNumberFormatting } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { getEventHandlers, customOnChangeValueEventHandler, addContextData } from '@/components/formDesigner/components/utils';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { InputNumber, InputNumberProps } from 'antd';
import { ShaIcon } from '@/components/shaIcon';
import { isPropertySettings } from '../_settings/utils';
import { ValueType } from 'rc-input-number';

const suffixStyle = { color: 'rgba(0,0,0,.45)' };

const NumberFieldComponent: NumberFieldComponentDefinition = {
  allowInherite: true,
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  calculateModel: (model, allData) => {
    return {
      eventHandlers: { ...getEventHandlers(model, allData), ...customOnChangeValueEventHandler(model, allData) },
      executeCustomFormat: (value: ValueType, code: string): string => executeScriptSync(code, addContextData(allData, { value })),
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const [, forceRefresh] = useState({});

    const { styles } = useStyles({
      fontFamily: model.font?.type,
      fontWeight: model.font?.weight,
      textAlign: model.font?.align,
      color: model.font?.color,
      fontSize: model.font?.size,
      padding: {
        padding: model.allStyles?.fullStyle?.padding,
        paddingLeft: model.allStyles?.fullStyle?.paddingLeft,
        paddingRight: model.allStyles?.fullStyle?.paddingRight,
        paddingTop: model.allStyles?.fullStyle?.paddingTop,
        paddingBottom: model.allStyles?.fullStyle?.paddingBottom,
      },
      hasSuffix: model.suffix || model.suffixIcon,
      hasPrefix: model.prefix || model.prefixIcon,
    });

    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    const prefix = useMemo(() => {
      return model.numberFormat === 'custom'
        ? <>{model.prefixIcon && <ShaIcon iconName={model.prefixIcon} style={suffixStyle} />}{model.prefix}</>
        : null;
    }, [model.numberFormat, model.prefix, model.prefixIcon]);
    const suffix = useMemo(() => {
      return model.numberFormat === 'custom'
        ? <>{model.suffix}{model.suffixIcon && <ShaIcon iconName={model.suffixIcon} style={suffixStyle} />}</>
        : null;
    }, [model.numberFormat, model.suffix, model.suffixIcon]);

    const inputProps: InputNumberProps = {
      disabled: model.readOnly,
      variant: model.hideBorder ? 'borderless' : undefined,
      // min: model.validate?.minValue !== undefined ? model.validate?.minValue : null,
      // max: model.validate?.maxValue !== undefined ? model.validate?.maxValue : Number.MAX_SAFE_INTEGER,
      placeholder: model.placeholder,
      size: model.size,
      ...calculatedModel.eventHandlers,
      defaultValue: calculatedModel.defaultValue,
      changeOnWheel: false,
      prefix,
      suffix,
      stringMode: true,
      controls: false,
    };

    if (model.thousandsSeparator || model.numberFormat === 'percent') {
      inputProps.formatter = (value) => {
        if (isPropertySettings(model.customFormat) && model.customFormat._mode === 'code' && model.customFormat._code) {
          return calculatedModel.executeCustomFormat(value, model.customFormat._code);
        }

        if (value === null || value === undefined || value === '') return '';

        const strValue = value.toString();
        return (Boolean(model.thousandsSeparator) ? strValue.replace(/\B(?=(\d{3})+(?!\d))/g, model.thousandsSeparator) : strValue) + (model.numberFormat === 'percent' ? ' %' : '');
      };
      inputProps.parser = (value) => {
        if (value === null || value === undefined) return value;
        const ts = model.thousandsSeparator;
        const regex = new RegExp(`[+-]?(?:\\d+${(Boolean(ts) ? `(?:${ts}\\d*)*` : '')}(?:\\.\\d*)?|\\.\\d+)`, 'g');

        const match = value.match(regex);
        if (match) {
          const rawNumber = match[0]; // "-1,234.56"
          const cleanNumber = Boolean(ts) ? rawNumber.replaceAll(ts, '') : rawNumber; // "-1234.56"
          return parseFloat(cleanNumber); // -1234.56
        }
        return undefined;
      };
    }

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle;

    return (
      <ConfigurableFormItem model={model} initialValue={calculatedModel.defaultValue}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (val: number | string | null): void => {
            let newValue = val;
            let numValue = 0;
            if (val !== undefined && val !== null) {
              const strVal = val.toString();
              const decimal = strVal.indexOf('.');
              const numDecimalPlaces = model.numberFormat === 'integer' ? 0 : model.numDecimalPlaces;
              const formattedValue = numDecimalPlaces !== undefined && numDecimalPlaces !== null && decimal !== -1
                ? strVal.substring(0, decimal + numDecimalPlaces + 1)
                : strVal;
              numValue = parseFloat(formattedValue);
              if (model.validate?.minValue !== undefined && model.validate?.minValue < 0 && numValue < model.validate?.minValue) {
                numValue = value;
                newValue = model.highPrecision ? numValue.toString() : numValue;
              }
              if (model.validate?.maxValue !== undefined && numValue > model.validate?.maxValue) {
                numValue = value;
                newValue = model.highPrecision ? numValue.toString() : numValue;
              }

              newValue = model.highPrecision ? formattedValue : numValue;
            }

            customEvents.onChange(newValue);
            onChange(newValue);

            // force refresh because Antd InputNumber does not trigger render
            forceRefresh({});
          };
          return model.readOnly
            ? <ReadOnlyDisplayFormItem type="number" value={getNumberFormat(value, getDataProperty(properties, model.propertyName, 'dataFormat'))} style={finalStyle} />
            : (
              <InputNumber
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
      .add<INumberFieldComponentPropsV1>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<INumberFieldComponentPropsV1>(1, (prev) => migrateVisibility(prev))
      .add<INumberFieldComponentPropsV1>(2, (prev) => migrateReadOnly(prev))
      .add<INumberFieldComponentPropsV1>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<INumberFieldComponentPropsV1>(4, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          hideBorder: prev.hideBorder,
          stylingBox: prev.stylingBox,
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles } }; // , tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<INumberFieldComponentPropsV1>(5, (prev, context) => context.isNew ? { ...prev, desktop: { ...migrateStyles(prev, defaultStyles(), 'desktop') } } : { ...migratePrevStyles(prev, defaultStyles()) })
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
  initModelFromMetadata: (prevModel, model) => {
    if (prevModel.description !== model.description) {
      return new Promise((resolve) => setTimeout(() => resolve({ ...model, placeholder: model.description }), 1000));
    }
    return Promise.resolve(model);
  },
  linkToModelMetadata: (model, metadata): INumberFieldComponentProps => {
    const numFormat = isNumberFormatting(metadata.formatting) ? metadata.formatting as INumberFormatting : null;
    const decimalFormat = isDecimalFormatting(metadata.formatting) ? metadata.formatting as IDecimalFormatting : null;
    return {
      ...model,
      numberFormat: metadata.dataType === DataTypes.number
        ? metadata.dataFormat === NumberFormats.int64 || metadata.dataFormat === NumberFormats.int32
          ? 'integer'
          : decimalFormat?.showAsPercentage
            ? 'percent'
            : 'decimal'
        : 'custom',
      numDecimalPlaces: decimalFormat?.numDecimalPlaces,
      thousandsSeparator: numFormat?.thousandsSeparator,
    };
  },
};

export default NumberFieldComponent;
