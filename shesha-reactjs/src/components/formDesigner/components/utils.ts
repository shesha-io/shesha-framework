import { DOMAttributes, SyntheticEvent } from 'react';
import { ObservableProxy } from '@/providers/form/observableProxy';
import { TouchableProxy } from '@/providers/form/touchableProxy';

export const addContextData = <TContext extends object = object, TExtension extends object = object, TExtended extends TContext & TExtension = TContext & TExtension>(context: TContext, additionalContext: TExtension): TExtended => {
  // if context is an ObservableProxy
  if (context instanceof ObservableProxy || context instanceof TouchableProxy) {
    for (const propName in additionalContext) {
      if (additionalContext.hasOwnProperty(propName)) {
        context.addAccessor(propName, () => additionalContext[propName]);
      }
    }
    return context as unknown as TExtended;
  }
  // if context is a simple object
  return { ...context, ...additionalContext } as TExtended;
};

export interface IEventHandlers<T extends HTMLElement = HTMLElement, V = unknown> extends Pick<DOMAttributes<T>, 'onBlur' | 'onFocus' | 'onClick'> {
  onChange: (newValue: V | null, event?: SyntheticEvent) => void;
};

export const isValidGuid = (input: string): boolean => {
  if (!input) return false;
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(input);
};
