import { MessageInstance } from 'antd/es/message/interface';
import { AxiosInstance } from 'axios';
import { DOMAttributes } from 'react';
import { IAnyObject, IConfigurableFormComponent } from '@/interfaces';
import { IGooglePlacesAutocompleteProps } from '@/components';
import { ISetStatePayload } from '@/providers/globalState/contexts';
import { CustomLabeledValue } from '@/components/autocomplete';
import { IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import { IOpenCageResponse } from '../../googlePlacesAutocomplete/models';
import { FormApi } from '@/providers/form/formApi';

type SetGlobalStateFunc = (payload: ISetStatePayload) => void;

export interface ICustomEventHandler {
  model: IConfigurableFormComponent;
  form: FormApi;
  formData: any;
  globalState: IAnyObject;
  http: AxiosInstance;
  message: MessageInstance;
  moment: object;
  setGlobalState: (payload: ISetStatePayload) => void;
};

export interface ICustomAddressEventHandler extends ICustomEventHandler {
  onChange: Function;
  onSelect: (selected: IAddressAndCoords) => Promise<IOpenCageResponse | IAddressAndCoords>;
};

export const onCustomEventsHandler = <FormCustomEvent = any>(
  event: FormCustomEvent,
  customEventAction: string,
  form: FormApi,
  formData: any,
  globalState: IAnyObject,
  http: AxiosInstance,
  message: MessageInstance,
  moment: object,
  value: any,
  setGlobalState: SetGlobalStateFunc
) => {
  /* tslint:disable:function-constructor */
  const eventFunc = new Function(
    'data',
    'event',
    'form',
    'globalState',
    'http',
    'message',
    'moment',
    'value',
    'setGlobalState',
    customEventAction
  );
  return eventFunc(formData, event, form, globalState, http, message, moment, value, setGlobalState);
};

type EventHandlerAttributes<T = any> = Pick<DOMAttributes<T>, 'onBlur' | 'onChange' | 'onFocus' | 'onClick'>;

export const customEventHandler = <T = any>({
  model,
  form,
  formData,
  globalState,
  http,
  message,
  moment,
  setGlobalState,
}: ICustomEventHandler): EventHandlerAttributes<T> => {
  const onCustomEvent = (event: any, key: string) => {
    return onCustomEventsHandler(
      event,
      model?.[key],
      form,
      formData,
      globalState,
      http,
      message,
      moment,
      event?.currentTarget.value,
      setGlobalState
    );

  };


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
  globalState,
  http,
  message,
  moment,
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, dateString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, dateString, form, globalState, http, message, moment, value, setGlobalState',
      model?.onChangeCustom
    );
    return eventFunc(
      formData,
      dateString,
      form,
      globalState,
      http,
      message,
      moment,
      value,
      setGlobalState
    );
  },
});

export const customTimeEventHandler = ({
  model,
  form,
  formData,
  globalState,
  http,
  message,
  moment,
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, timeString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, timeString, form, globalState, http, message, moment, value, setGlobalState',
      model?.onChangeCustom
    );
    return eventFunc(
      formData,
      timeString,
      form,
      globalState,
      http,
      message,
      moment,
      value,
      setGlobalState
    );
  },
});

export const customDropDownEventHandler = <T = any>({
  model,
  form,
  formData,
  globalState,
  http,
  message,
  moment,
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: CustomLabeledValue<T>, option: any) => {
    const eventFunc = new Function(
      'data, form, globalState, http, message, moment, option, value, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(
      formData,
      form,
      globalState,
      http,
      message,
      moment,
      option,
      value,
      setGlobalState
    );
  },
});

export const customInputNumberEventHandler = (
  {
    model,
    form,
    formData,
    globalState,
    http,
    message,
    moment,
    setGlobalState,
  }: ICustomEventHandler,
  changeEvent: Function
) => ({
  onChange: (value: any) => {
    changeEvent(value);

    const eventFunc = new Function(
      'data, form, globalState, http, message, moment, value, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, globalState, http, message, moment, value, setGlobalState);
  },
});

export const customRateEventHandler = ({
  model,
  form,
  formData,
  globalState,
  http,
  message,
  moment,
  setGlobalState,
}: ICustomEventHandler) => ({
  onChange: (value: number) => {
    const eventFunc = new Function(
      'data, form, globalState, http, message, moment, value, setGlobalState',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, globalState, http, message, moment, value, setGlobalState);
  },
});

export const customAddressEventHandler = ({
  model,
  form,
  formData,
  globalState,
  http,
  message,
  moment,
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
      globalState,
      http,
      message,
      moment,
      event?.currentTarget?.value,
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
  if (!input) return false;
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(input);
};
