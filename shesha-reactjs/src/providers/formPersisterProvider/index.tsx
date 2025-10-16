
import React, { FC, PropsWithChildren, useContext } from 'react';
import { useHttpClient } from '@/providers';
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
import { useRefInitialized } from '@/hooks';
import { FormPersister } from './formPersister';

export interface IFormProviderProps {
  formId: FormIdentifier;
  skipCache?: boolean;
}

const FormPersisterProvider: FC<PropsWithChildren<IFormProviderProps>> = ({ children, ...props }) => {
  const formManager = useFormManager();
  const httpClient = useHttpClient();
  const [, forceUpdate] = React.useState({});
  const persisterRef = useRefInitialized(() => {
    const forceReRender = (): void => {
      forceUpdate({});
    };

    return new FormPersister({
      forceRootUpdate: forceReRender,
      formId: props.formId,
      formManager: formManager,
      httpClient: httpClient,
    });
  });
  const persister = persisterRef.current;

  return (
    <FormPersisterStateContext.Provider value={persister.state}>
      <FormPersisterActionsContext.Provider value={persister}>
        {children}
      </FormPersisterActionsContext.Provider>
    </FormPersisterStateContext.Provider>
  );
};


function useFormPersisterState(require: boolean = true): IFormPersisterStateContext | undefined {
  const context = useContext(FormPersisterStateContext);

  if (require && context === undefined) {
    throw new Error('useFormPersisterState must be used within a FormPersisterProvider');
  }

  return context;
}

function useFormPersisterActions(require: boolean = true): IFormPersisterActionsContext | undefined {
  const context = useContext(FormPersisterActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormPersisterActions must be used within a FormPersisterProvider');
  }

  return context;
}

const useFormPersisterIfAvailable = (require: boolean = false): IFormPersisterContext | undefined => {
  const actionsContext = useFormPersisterActions(require);
  const stateContext = useFormPersisterState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useFormPersister = (): IFormPersisterContext => useFormPersisterIfAvailable(true)!;

export { FormPersisterProvider, useFormPersister, useFormPersisterIfAvailable, useFormPersisterState };
