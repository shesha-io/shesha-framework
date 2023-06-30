import { InputNumber, InputNumberProps, message } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import moment from 'moment';
import React, { FC } from 'react';
import { axiosHttp } from '../../utils/fetchers';
import { useForm, useGlobalState, useSheshaApplication } from '../../providers';
import { getStyle } from '../../providers/form/utils';
import { customInputNumberEventHandler } from '../../components/formDesigner/components/utils';
import { INumberFieldComponentProps } from './interfaces';

interface IProps {
  disabled: boolean;
  form: FormInstance;
  model: INumberFieldComponentProps;
  onChange?: Function;
  value?: number;
}

const NumberFieldControl: FC<IProps> = ({ disabled, form, model, onChange, value }) => {
  const { formMode, formData, setFormDataAndInstance } = useForm();
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
    setFormData: setFormDataAndInstance,
    setGlobalState,
  };

  const style = model.style;

  const inputProps: InputNumberProps = {
    className: 'sha-number-field',
    disabled: disabled,
    bordered: !model.hideBorder,
    min: model?.min,
    max: model?.max,
    size: model?.size,
    style: !!style ? getStyle(style, formData) : { width: '100%' },
    step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
    ...customInputNumberEventHandler(eventProps, onChange),
    defaultValue: model?.defaultValue,
  };

  return <InputNumber value={value} {...inputProps} stringMode={model?.highPrecision} />;
};

export default NumberFieldControl;
