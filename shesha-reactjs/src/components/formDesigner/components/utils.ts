import { FormInstance } from 'antd';
import { MessageApi } from 'antd/lib/message';
import { AxiosInstance } from 'axios';
import { DOMAttributes } from 'react';
import { IAnyObject, IConfigurableFormComponent } from '../../..';
import { ISetFormDataPayload } from '../../../providers/form/contexts';
import { FormMode } from '../../../providers/form/models';
import { CustomLabeledValue } from '../../autocomplete';

type SetFormDataFunc = (payload: ISetFormDataPayload) => void;

export interface ICustomEventHandler {
  model: IConfigurableFormComponent;
  form: FormInstance;
  formData: any;
  formMode: FormMode;
  globalState: IAnyObject;
  http: AxiosInstance;
  message: MessageApi;
  moment: object;
  setFormData: (payload: ISetFormDataPayload) => void;
}

export const onCustomEventsHandler = <FormCustomEvent = any>(
  event: FormCustomEvent,
  customEventAction: string,
  form: FormInstance,
  formData: any,
  formMode: FormMode,
  globalState: IAnyObject,
  http: AxiosInstance,
  message: MessageApi,
  moment: object,
  setFormData: SetFormDataFunc
) => {
  /* tslint:disable:function-constructor */
  const eventFunc = new Function(
    'data',
    'event',
    'form',
    'formMode',
    'globalState',
    'http',
    'message',
    'moment',
    'setFormData',
    customEventAction
  );

  return eventFunc(formData, event, form, formMode, globalState, http, message, moment, setFormData);
};

export const customEventHandler = <T = any>({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
}: ICustomEventHandler): DOMAttributes<T> => {
  const onCustomEvent = (event: any, key: string) =>
    onCustomEventsHandler(
      event,
      model?.[key],
      form,
      formData,
      formMode,
      globalState,
      http,
      message,
      moment,
      setFormData
    );

  return {
    onBlur: event => onCustomEvent(event, 'onBlurCustom'),
    onChange: event => onCustomEvent(event, 'onChangeCustom'),
    onFocus: event => onCustomEvent(event, 'onFocusCustom'),
  };
};

export const customDateEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, dateString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, dateString, form, formMode, globalState, http, message, moment, value, setFormData',
      model?.onChangeCustom
    );
    return eventFunc(formData, dateString, form, formMode, globalState, http, message, moment, value, setFormData);
  },
});

export const customDropDownEventHandler = <T = any>({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
}: ICustomEventHandler) => ({
  onChange: (value: CustomLabeledValue<T>, option: any) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, option, value, setFormData',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, option, value, setFormData);
  },
});

export const customInputNumberEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
}: ICustomEventHandler) => ({
  onChange: (value: any) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value, setFormData',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value, setFormData);
  },
});

export const customRateEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
}: ICustomEventHandler) => ({
  onChange: (value: number) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value, setFormData',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value, setFormData);
  },
});
