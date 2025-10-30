import React, { FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { IShaFormInstance } from '../store/interfaces';
import { DelayedUpdateProvider } from "../../delayedUpdateProvider";
import { ShaFormDataUpdateContext, ShaFormInstanceContext } from "../providers/contexts";
import { ShaFormSubscriptionType } from "../store/shaFormInstance";

export interface IShaFormProviderProps {
  shaForm: IShaFormInstance;
}

const ShaFormProvider: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, shaForm }) => {
  const [state, setState] = React.useState({});

  // force update context on change form data
  useEffect(() => {
    shaForm.updateData = () => setState({});
  }, []);

  return (
    <ShaFormInstanceContext.Provider value={shaForm}>
      <ShaFormDataUpdateContext.Provider value={state}>
        {children}
      </ShaFormDataUpdateContext.Provider>
    </ShaFormInstanceContext.Provider>
  );
};

const FormProviderWithDelayedUpdates: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, ...props }) => {
  return (
    <DelayedUpdateProvider>
      <ShaFormProvider {...props}>
        {children}
      </ShaFormProvider>
    </DelayedUpdateProvider>
  );
};

const useShaFormRef = <Values extends object = object>(): MutableRefObject<IShaFormInstance<Values>> => {
  return useRef<IShaFormInstance<Values>>();
};

const useShaFormDataUpdate = (): object => useContext(ShaFormDataUpdateContext);

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

export {
  FormProviderWithDelayedUpdates as ShaFormProvider,
  useShaFormInstance,
  useShaFormInstanceOrUndefined,
  useShaFormDataUpdate,
  useShaFormRef,
  useShaFormSubscription,
};
