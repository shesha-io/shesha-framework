import { MessageInstance } from 'antd/es/message/interface';
import { DOMAttributes } from 'react';
import { IAnyObject, IConfigurableFormComponent } from '@/interfaces';
import { IGooglePlacesAutocompleteProps } from '@/components';
import { ISetStatePayload } from '@/providers/globalState/contexts';
import { IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import { IOpenCageResponse } from '../../googlePlacesAutocomplete/models';
import { IFormApi } from '@/providers/form/formApi';
import { HttpClientApi } from '@/publicJsApis/httpClient';
import { IApplicationContext, executeScriptSync } from '@/index';
import { ObservableProxy } from '@/providers/form/observableProxy';
import { CustomLabeledValue } from '@/components/refListDropDown/models';
import { TouchableProxy } from '@/providers/form/touchableProxy';

type SetGlobalStateFunc = (payload: ISetStatePayload) => void;

export interface ICustomEventHandler {
  model: IConfigurableFormComponent;
  form: IFormApi;
  formData: any;
  globalState: IAnyObject;
  http: HttpClientApi;
  message: MessageInstance;
  moment: object;
  setGlobalState: (payload: ISetStatePayload) => void;
};

export const addContextData = (context: any, additionalContext: any) => {
  // if context is an ObservableProxy
  if (context instanceof ObservableProxy || context instanceof TouchableProxy) {
    for(const propName in additionalContext) {
      if (additionalContext.hasOwnProperty(propName)) {
        context.addAccessor(propName, () => additionalContext[propName]);
      }
    }
    return context;
  }
  // if context is a simple object
  return {...context, ...additionalContext};
};

export interface ICustomAddressEventHandler extends ICustomEventHandler {
  onChange: Function;
  onSelect: (selected: IAddressAndCoords) => Promise<IOpenCageResponse | IAddressAndCoords>;
};

export type EventHandlerAttributes<T = any> = Pick<DOMAttributes<T>, 'onBlur' | 'onChange' | 'onFocus' | 'onClick'>;

export interface IEventHandlers<T = any> extends Pick<DOMAttributes<T>, 'onBlur' | 'onFocus' | 'onClick'>{
  onChange: (values: object, event?: any) => void;
};

/** @deprecated use getAllEventHandlers instead */
export const getEventHandlers = <T = any>(model: IConfigurableFormComponent, context: IApplicationContext): EventHandlerAttributes<T> => {
  const onCustomEvent = (event: any, key: string) => {
    const expression = model?.[key];
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {event, value: event?.currentTarget.value}));
    }
  };

  return {
    onBlur: (event) => onCustomEvent(event, 'onBlurCustom'),
    onChange: (event) => onCustomEvent(event, 'onChangeCustom'),
    onFocus: (event) => onCustomEvent(event, 'onFocusCustom'),
    onClick: (event) => onCustomEvent(event, 'onClickCustom'),
  };
};

export const getAllEventHandlers = <T = any>(model: IConfigurableFormComponent, context: IApplicationContext): IEventHandlers<T> => {
  const onCustomEvent = (event: any, key: string) => {
    const expression = model?.[key];
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {event, value: event?.currentTarget.value}));
    }
  };

  const onChange = (values: object, event: any) => {
    const expression = model?.onChangeCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, { event, ...values }));
    }
  };

  return {
    onBlur: (event) => onCustomEvent(event, 'onBlurCustom'),
    onChange: (values: object, event?: any) => onChange(values, event),
    onFocus: (event) => onCustomEvent(event, 'onFocusCustom'),
    onClick: (event) => onCustomEvent(event, 'onClickCustom'),
  };
};

export const customDateEventHandler = (model: IConfigurableFormComponent, context: IApplicationContext) => ({
  onChange: (value: any | null, dateString: string | [string, string]) => {
    const expression = model?.onChangeCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {dateString, value}));
    }
  },
});

export const customTimeEventHandler = (model: IConfigurableFormComponent, context: IApplicationContext) => ({
  onChange: (value: any | null, timeString: string | [string, string]) => {
    const expression = model?.onChangeCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {timeString, value}));
    }
  },
});

export const customDropDownEventHandler = <T = any>(model: IConfigurableFormComponent, context: IApplicationContext) => ({
  onChange: (value: CustomLabeledValue<T>, option: any) => {
    const expression = model?.onChangeCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {option, value}));
    }
  },
});

export const customOnChangeValueEventHandler = (model: IConfigurableFormComponent, context: IApplicationContext) => ({
  onChange: (value: any) => {
    const expression = model?.onChangeCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {value}));
    }
  },
});

export const customOnClickEventHandler = (model: IConfigurableFormComponent, context: IApplicationContext, clickEvent: Function = null) => ({
  onClick: (value: any) => {
    if (typeof clickEvent === 'function')
      clickEvent(value);
    const expression = model?.onClickCustom;
    if (Boolean(expression)) {
      return executeScriptSync(expression, addContextData(context, {value}));
    }
  },
});

export const onCustomEventsHandler = <FormCustomEvent = any>(
  event: FormCustomEvent,
  customEventAction: string,
  form: IFormApi,
  formData: any,
  globalState: IAnyObject,
  http: HttpClientApi,
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

export const customAddressEventHandler = (
  model: IConfigurableFormComponent,
  context: IApplicationContext,
  onChangeCustom,
  onSelectCustom,
  onFocusCustom,
): IGooglePlacesAutocompleteProps => {

  const onCustomEvent = (event: any, key: string) => {
    const expression = model?.[key];
    if (Boolean(expression)) {
      // if context is an ObservableProxy
      if (typeof context['addAccessor'] === 'function') {
        const ctx = context as any as ObservableProxy<IApplicationContext>;
        ctx.addAccessor('event', () => event);
        ctx.addAccessor('value', () => event?.currentTarget.value);
        return executeScriptSync(expression, context);
      }

      // if context is a simple object
      return executeScriptSync(expression, { ...context, event, value: event?.currentTarget.value });
    }
  };

  const onChange = (e: string) => {
    onChangeCustom(e);
    onCustomEvent(e, 'onChangeCustom');
  };

  const onFocus = (e: string) => {
    onFocusCustom(e);
    onCustomEvent(e, 'onFocusCustom');
  };

  const onGeocodeChange = (event: IAddressAndCoords) =>
    onSelectCustom(event).then((payload) => onCustomEvent({ ...event, ...(payload || {}) }, 'onSelectCustom'));

  return {
    onChange,
    onGeocodeChange,
    onFocus
  };
};

export const isValidGuid = (input: string): boolean => {
  if (!input) return false;
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(input);
};
