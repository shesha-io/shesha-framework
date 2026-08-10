
import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { useConfigurationItemsLoader, useHttpClient } from '@/providers';
import {
  FormIdentifier,
} from '../form/models';

import {
  FormPersisterActionsContext,
  FormPersisterStateContext,
  IFormPersisterActionsContext,
  IFormPersisterContext,
  IFormPersisterStateContext,
} from './contexts';
import { useFormManager } from '../formManager';
import { FormPersister } from './formPersister';
import { throwError } from '@/utils/errors';

export interface IFormProviderProps {
  formId: FormIdentifier;
  skipCache?: boolean;
}

const FormPersisterProvider: FC<PropsWithChildren<IFormProviderProps>> = ({ children, ...props }) => {
  const formManager = useFormManager();
  const httpClient = useHttpClient();
  const configurationItemsLoader = useConfigurationItemsLoader();
  const [, forceUpdate] = React.useState({});
  const [persister] = useState(() => {
    const forceReRender = (): void => {
      forceUpdate({});
    };

    return new FormPersister({
      forceRootUpdate: forceReRender,
      formId: props.formId,
      formManager: formManager,
      httpClient: httpClient,
      configurationItemsLoader: configurationItemsLoader,
    });
  });

  return (
    <FormPersisterStateContext.Provider value={persister.state}>
      <FormPersisterActionsContext.Provider value={persister}>
        {children}
      </FormPersisterActionsContext.Provider>
    </FormPersisterStateContext.Provider>
  );
};


const useFormPersisterStateOrUndefined = (): IFormPersisterStateContext | undefined => useContext(FormPersisterStateContext);
const useFormPersisterState = (): IFormPersisterStateContext => useFormPersisterStateOrUndefined() ?? throwError("useFormPersisterState must be used within a FormPersisterProvider");

const useFormPersisterActionsOrUndefined = (): IFormPersisterActionsContext | undefined => useContext(FormPersisterActionsContext);
const useFormPersisterActions = (): IFormPersisterActionsContext => useFormPersisterActionsOrUndefined() ?? throwError("useFormPersisterActions must be used within a FormPersisterProvider");

const useFormPersisterIfAvailable = (): IFormPersisterContext | undefined => {
  const actionsContext = useFormPersisterActionsOrUndefined();
  const stateContext = useFormPersisterStateOrUndefined();

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useFormPersister = (): IFormPersisterContext => useFormPersisterIfAvailable() ?? throwError("useFormPersister must be used within a FormPersisterProvider");

export { FormPersisterProvider, useFormPersister, useFormPersisterIfAvailable, useFormPersisterState, useFormPersisterActions };
