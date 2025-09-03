import { InputNumber, InputNumberProps } from 'antd';
import React, { FC, useEffect } from 'react';
import { customOnChangeValueEventHandler } from '@/components/formDesigner/components/utils';
import { getStyle, useAvailableConstantsData } from '@/providers/form/utils';
import { INumberFieldComponentProps } from './interfaces';

interface IProps {
  disabled: boolean;
  model: INumberFieldComponentProps;
  onChange?: (value: number) => void;
  value?: number | null;
}

const NumberFieldControl: FC<IProps> = ({ disabled, model, onChange, value }) => {
  const allData = useAvailableConstantsData();

  const style = model.style;

  // Coerce null/undefined to fallback, preserving 0
  const zero = 0;
  const emptyFallback =
    model?.min != null && model.min > 0
      ? model.min
      : zero;
  const coercedValue = value ?? emptyFallback;

  // Create a wrapped onChange that coerces null/undefined, handles string to number conversion for highPrecision
  const wrappedOnChange = (v: number | string | null) => {
    let numericValue = (v == null) ? emptyFallback : (typeof v === 'string' ? parseFloat(v) : v);
    if (isNaN(numericValue)) numericValue = emptyFallback;
    onChange?.(numericValue);
  };

  // Ensure value is set to fallback on initial render if null/undefined
  useEffect(() => {
    if (value == null && onChange) {
      onChange(emptyFallback);
    }
  }, [value, onChange, emptyFallback]);

  const inputProps: InputNumberProps = {
    className: 'sha-number-field',
    disabled: disabled,
    variant: model.hideBorder ? 'borderless' : undefined,
    min: model?.min,
    max: model?.max,
    placeholder: model?.placeholder,
    size: model?.size,
    style: style ? getStyle(style, allData.data, allData.globalState) : { width: '100%' },
    step: model?.stepNumeric,
    ...customOnChangeValueEventHandler(model, allData, wrappedOnChange),
    defaultValue: model?.defaultValue ?? 0,
    changeOnWheel: false,
  };

  return (
    <InputNumber
      value={model?.highPrecision ? String(coercedValue) : coercedValue}
      {...inputProps}
      stringMode={model?.highPrecision}
    />
  );
};

export default NumberFieldControl;
