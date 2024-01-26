import { InputNumber, InputNumberProps, message } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import moment from 'moment';
import React, { FC } from 'react';
import { customInputNumberEventHandler } from '@/components/formDesigner/components/utils';
import { useForm, useGlobalState, useSheshaApplication } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { INumberFieldComponentProps } from './interfaces';

interface IProps {
  disabled: boolean;
  form: FormInstance;
  model: INumberFieldComponentProps;
  onChange?: Function;
  value?: number;
}

const NumberFieldControl: FC<IProps> = ({ disabled, form, model, onChange, value }) => {
  const { formMode, formData, setFormData } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();

  const eventProps = {
    model,
    form,
    formData,
    formMode,
    globalState,
    http: axiosHttp(backendUrl),
    message,
    moment,
    setFormData,
    setGlobalState,
  };

  const style = model.style;

  const inputProps: InputNumberProps = {
    className: 'sha-number-field',
    disabled: disabled,
    variant: model.hideBorder ? 'borderless' : undefined,
    min: model?.min,
    max: model?.max,
    placeholder: model?.placeholder,
    size: model?.size,
    style: style ? getStyle(style, formData, globalState) : { width: '100%' },
    step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
    ...customInputNumberEventHandler(eventProps, onChange),
    defaultValue: model?.defaultValue,
    wheel: false,
  };

  return <InputNumber value={value} {...inputProps} stringMode={model?.highPrecision} />;
};

export default NumberFieldControl;
