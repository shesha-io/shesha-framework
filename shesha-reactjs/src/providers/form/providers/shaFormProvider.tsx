import React, { MutableRefObject, PropsWithChildren, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { IShaFormInstance } from '../store/interfaces';
import { DelayedUpdateProvider } from "../../delayedUpdateProvider";
import { ShaFormDataUpdateContext, ShaFormInstanceContext } from "../providers/contexts";
import { ShaFormSubscriptionType } from "../store/shaFormInstance";

export interface IShaFormProviderProps<TValues extends object = object> {
  shaForm: IShaFormInstance<TValues>;
}

const ShaFormProvider = <TValues extends object = object>({ children, shaForm }: PropsWithChildren<IShaFormProviderProps<TValues>>): ReactNode => {
  const [state, setState] = React.useState({});

  // force update context on change form data
  useEffect(() => {
    shaForm.updateData = () => setState({});
  }, [shaForm]);

  // TODO V1: replace with generic provider and remove unsafe type cast
  return (
    <ShaFormInstanceContext.Provider value={shaForm as unknown as IShaFormInstance}>
      <ShaFormDataUpdateContext.Provider value={state}>
        {children}
      </ShaFormDataUpdateContext.Provider>
    </ShaFormInstanceContext.Provider>
  );
};

const FormProviderWithDelayedUpdates = <TValues extends object = object>({ children, ...props }: PropsWithChildren<IShaFormProviderProps<TValues>>): ReactNode => {
  return (
    <DelayedUpdateProvider>
      <ShaFormProvider {...props}>
        {children}
      </ShaFormProvider>
    </DelayedUpdateProvider>
  );
};

const useShaFormRef = <Values extends object = object>(): MutableRefObject<IShaFormInstance<Values> | undefined> => {
  return useRef<IShaFormInstance<Values>>();
};

const useShaFormDataUpdate = (): object | undefined => useContext(ShaFormDataUpdateContext);

const useShaFormInstanceOrUndefined = (): IShaFormInstance | undefined => {
  return useContext(ShaFormInstanceContext);
};

const useShaFormInstance = (): IShaFormInstance => {
  const context = useShaFormInstanceOrUndefined();
  if (context === undefined)
    throw new Error('useShaFormInstance must be used within a ShaFormProvider');

  return context;
};

const useShaFormSubscription = (subscriptionType: ShaFormSubscriptionType): object => {
  const shaForm = useShaFormInstance();
  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = shaForm.subscribe(subscriptionType, () => forceUpdate({}));
    return unsubscribe; // Cleanup on unmount
  }, [shaForm, subscriptionType]);

  return dummy;
};

const useShaFormDataModified = (): boolean => {
  const shaForm = useShaFormInstance();
  useShaFormDataUpdate();
  useShaFormSubscription('data-modified');
  return shaForm.isDataModified;
};

export {
  FormProviderWithDelayedUpdates as ShaFormProvider,
  useShaFormInstance,
  useShaFormInstanceOrUndefined,
  useShaFormDataUpdate,
  useShaFormRef,
  useShaFormSubscription,
  useShaFormDataModified,
};
