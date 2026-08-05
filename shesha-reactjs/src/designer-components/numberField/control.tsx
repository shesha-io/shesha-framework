import { InputNumber, InputNumberProps } from 'antd';
import React, { FC } from 'react';
import { customOnChangeValueEventHandler } from '@/components/formDesigner/components/utils';
import { getStyle, useAvailableConstantsData } from '@/providers/form/utils';
import { INumberFieldComponentProps } from './interfaces';

interface IProps {
  disabled: boolean;
  model: INumberFieldComponentProps;
  onChange?: Function;
  value?: number;
}

const NumberFieldControl: FC<IProps> = ({ disabled, model, onChange, value }) => {
  const allData = useAvailableConstantsData();

  const style = model.style;

  const inputProps: InputNumberProps = {
    className: 'sha-number-field',
    disabled: disabled,
    variant: model.hideBorder ? 'borderless' : undefined,
    min: model?.min,
    max: model?.max,
    placeholder: model?.placeholder,
    size: model?.size,
    style: style ? getStyle(style, allData.data, allData.globalState) : { width: '100%' },
    step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
    ...customOnChangeValueEventHandler(model, allData, onChange),
    // NOTE: antd's `defaultValue` is deliberately not passed here. It only feeds the control's own
    // uncontrolled state, so it would render a value that is absent from the form data and therefore
    // never submitted. The configured default is written into the form data instead (see numberField.tsx).
    changeOnWheel: false,
  };

  return <InputNumber value={value} {...inputProps} stringMode={model?.highPrecision} />;
};

export default NumberFieldControl;
