import { FormInstance } from 'antd';
import { MessageApi } from 'antd/lib/message';
import { AxiosInstance } from 'axios';
import { DOMAttributes } from 'react';
import { IAnyObject, IConfigurableFormComponent, IGooglePlacesAutocompleteProps } from '../../..';
import { ISetFormDataPayload } from '../../../providers/form/contexts';
import { FormMode } from '../../../providers/form/models';
import { ISetStatePayload } from '../../../providers/globalState/contexts';
import { CustomLabeledValue } from '../../autocomplete';
import { IAddressAndCoords } from '../../googlePlacesAutocomplete';
import { IOpenCageResponse } from '../../googlePlacesAutocomplete/models';

type SetFormDataFunc = (payload: ISetFormDataPayload) => void;
type SetGlobalStateFunc = (payload: ISetStatePayload) => void;

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
  setGlobalState: (payload: ISetStatePayload) => void;
}

export interface ICustomAddressEventHandler extends ICustomEventHandler {
  onChange: Function;
  onSelect: (selected: IAddressAndCoords) => Promise<IOpenCageResponse | IAddressAndCoords>;
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
  setFormData: SetFormDataFunc,
  setGlobalState: SetGlobalStateFunc
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
    'setGlobalState',
    customEventAction
  );

  return eventFunc(formData, event, form, formMode, globalState, http, message, moment, setFormData, setGlobalState);
};

type EventHandlerAttributes<T = any> = Pick<DOMAttributes<T>, 'onBlur' | 'onChange' | 'onFocus' | 'onClick'>;

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
  setGlobalState,
}: ICustomEventHandler): EventHandlerAttributes<T> => {
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
      setFormData,
      setGlobalState
    );

  return {
    onBlur: (event) => onCustomEvent(event, 'onBlurCustom'),
    onChange: (event) => onCustomEvent(event, 'onChangeCustom'),
    onFocus: (event) => onCustomEvent(event, 'onFocusCustom'),
    onClick: (event) => {
      event.stopPropagation();
    },
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
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, dateString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, dateString, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState',
      model?.onChangeCustom
    );
    return eventFunc(
      formData,
      dateString,
      form,
      formMode,
      globalState,
      http,
      message,
      moment,
      value,
      setFormData,
      setGlobalState
    );
  },
});

export const customTimeEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, timeString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, timeString, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState',
      model?.onChangeCustom
    );
    return eventFunc(
      formData,
      timeString,
      form,
      formMode,
      globalState,
      http,
      message,
      moment,
      value,
      setFormData,
      setGlobalState
    );
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
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: CustomLabeledValue<T>, option: any) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, option, value, setFormData, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(
      formData,
      form,
      formMode,
      globalState,
      http,
      message,
      moment,
      option,
      value,
      setFormData,
      setGlobalState
    );
  },
});

export const customInputNumberEventHandler = (
  {
    model,
    form,
    formData,
    formMode,
    globalState,
    http,
    message,
    moment,
    setFormData,
    setGlobalState,
  }: ICustomEventHandler,
  changeEvent: Function
) => ({
  onChange: (value: any) => {
    changeEvent(value);

    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState);
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
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: number) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value, setFormData, setGlobalState);
  },
});

export const customAddressEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
  setFormData,
  setGlobalState,
  onChange: onChangeCustom,
  onSelect,
}: ICustomAddressEventHandler): IGooglePlacesAutocompleteProps => {
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
      setFormData,
      setGlobalState
    );

  const onChange = (e: string) => {
    onChangeCustom(e);
    onCustomEvent(e, 'onChangeCustom');
  };

  const onGeocodeChange = (event: IAddressAndCoords) =>
    onSelect(event).then((payload) => onCustomEvent({ ...event, ...(payload || {}) }, 'onSelectCustom'));

  return {
    onChange,
    onGeocodeChange,
  };
};
export const isValidGuid = (input: string): boolean => {
  if(!input) return false;
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(input);
};
