import { NumberOutlined } from '@ant-design/icons';
import React, { useMemo, useRef, useState } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { DataTypes, NumberFormats } from '@/interfaces/dataTypes';
import { IComponentValidationRules, IInputStyles, useMetadataOrUndefined } from '@/providers';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { INumberFieldComponentProps, INumberFieldComponentPropsV1, NumberFieldComponentDefinition } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { numberToFormattedString } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray, IDecimalFormatting, INumberFormatting, isDecimalFormatting, isNumberFormatting } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '../_common-migrations/migrateStyles';
import { addContextData } from '@/components/formDesigner/components/utils';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { InputNumber, InputNumberProps } from 'antd';
import { ShaIcon } from '@/components/shaIcon';
import { isPropertySettings } from '../_settings/utils/utils';
import { useComponentApi } from '@/providers/componentApi/provider';
import { NumberFieldApi } from '../../componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

const suffixStyle = { color: 'rgba(0,0,0,.45)' };

export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}
export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  nativeElement: HTMLElement;
}

const NumberFieldComponent: NumberFieldComponentDefinition = {
  allowInherit: true,
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  calculateModel: (_, allData) => {
    return {
      executeCustomFormat: (value: unknown, code: string): string => executeScriptSync(code, addContextData(allData, { value })) ?? "",
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const [, forceRefresh] = useState({});

    const componentApi = useComponentApi();
    const inputRef = useRef<InputNumberRef>(null);
    componentApi?.updateApi<NumberFieldApi>(
      {
        id: model.id,
        componentName: model.componentName ?? "",
        typeDefinition: { typeName: 'NumberFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      },
    );
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles({
      fontFamily: model.font?.type,
      fontWeight: model.font?.weight,
      textAlign: model.font?.align,
      color: model.font?.color,
      fontSize: model.font?.size,
      padding: {
        paddingLeft: model.allStyles?.fullStyle.paddingLeft,
      },
      hasSuffix: !isNullOrWhiteSpace(model.suffix ?? model.suffixIcon),
      hasPrefix: !isNullOrWhiteSpace(model.prefix ?? model.prefixIcon),
    });

    const { properties: metaProperties } = useMetadataOrUndefined()?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties ?? [], []);

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

    const inputProps: InputNumberProps<number> = {
      disabled: model.readOnly === true,
      ...(model.hideBorder ? { variant: 'borderless' } : {}),
      placeholder: model.placeholder,
      size: model.size,
      changeOnWheel: false,
      prefix,
      suffix,
      stringMode: true,
      controls: false,
      ...(model.validate?.maxValue ? { max: model.validate.maxValue } : {}),
      ...(model.validate?.minValue ? { min: model.validate.minValue } : {}),
    };

    // ToDo: AS - implement custom number formatting
    if (model.thousandsSeparator || model.numberFormat === 'percent' || (isPropertySettings(model.customFormat) && model.customFormat._mode === 'code' && model.customFormat._code)) {
      inputProps.formatter = (value) => {
        if (isPropertySettings(model.customFormat) && model.customFormat._mode === 'code' && model.customFormat._code) {
          if (isDefined(calculatedModel.executeCustomFormat))
            return calculatedModel.executeCustomFormat(value, model.customFormat._code);
        }

        if (!isDefined(value)) return '';

        const strValue = value.toString();
        return (!isNullOrWhiteSpace(model.thousandsSeparator)
          ? strValue.replace(/\B(?=(\d{3})+(?!\d))/g, model.thousandsSeparator) : strValue) + (model.numberFormat === 'percent' ? ' %'
          : ''
        );
      };
      inputProps.parser = (value) => {
        if (!isDefined(value))
          return 0;
        const ts = model.thousandsSeparator;
        const escapedTs = ts ? ts.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
        const regex = new RegExp(`[+-]?(?:\\d+${(Boolean(ts) ? `(?:${escapedTs}\\d*)*` : '')}(?:\\.\\d*)?|\\.\\d+)`, 'g');

        const match = value.match(regex);
        if (match) {
          const rawNumber = match[0]; // "-1,234.56"
          const cleanNumber = !isNullOrWhiteSpace(ts) ? rawNumber.replaceAll(ts, '') : rawNumber; // "-1234.56"
          return parseFloat(cleanNumber); // -1234.56
        }
        return 0;
      };
    }

    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles?.fontStyles,
      ...model.allStyles?.dimensionsStyles,
    } : model.allStyles?.fullStyle;

    return (
      <ConfigurableFormItem<number> model={model}>
        {(value, onChange, _, ctx) => {
          return model.readOnly
            ? (
              <ReadOnlyDisplayFormItem
                type="number"
                value={numberToFormattedString(value?.toString() ?? "", model.propertyName ? getDataProperty(properties, model.propertyName, 'dataFormat') : undefined)}
                style={finalStyle}
              />
            )
            : (
              <InputNumber
                value={value ?? null}
                {...inputProps}
                {...(model.allStyles?.fullStyle ? { style: model.allStyles.fullStyle } : {})}
                className={styles.numberField}
                ref={inputRef}

                // TODO EVENTS
                onChange={(val) => {
                  let newValue = val;
                  let numValue = 0;
                  if (isDefined(val)) {
                    const strVal = val.toString();
                    const decimal = strVal.indexOf('.');
                    const numDecimalPlaces = model.numberFormat === 'integer' ? 0 : model.numDecimalPlaces;
                    const formattedValue = numDecimalPlaces !== undefined && isDefined(numDecimalPlaces) && decimal !== -1
                      ? strVal.substring(0, decimal + numDecimalPlaces + 1)
                      : strVal;
                    numValue = parseFloat(formattedValue);
                    newValue = model.highPrecision
                      ? parseFloat(formattedValue)
                      : Number.isNaN(numValue)
                        ? null
                        : numValue;
                  }

                  ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                  onChange(newValue);

                  // force refresh because Antd InputNumber does not trigger render
                  forceRefresh({});
                }}
                onFocus={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onFocusCustom)}
                onBlur={(event) => ctx?.handleEvent(event, event.currentTarget.value, model.onBlurCustom)}
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
          model.validate = {
            ...(prev.validate ?? {}),
            minValue: prev.min,
            maxValue: prev.max,
          } as IComponentValidationRules;
        }
        return model;
      }),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
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
