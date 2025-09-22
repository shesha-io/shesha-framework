import { useAuthOrUndefined, useSheshaApplication } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';

export interface IExcuteSignInArguments {}

export const useExecuteSignIn = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const auth = useAuthOrUndefined();

  useConfigurableAction<IExcuteSignInArguments>(
    {
      name: 'Sign In',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: false,
      executer: (_, actionContext) => auth?.loginUserAsync(actionContext?.form?.data),
    },
    [backendUrl, httpHeaders]
  );
};
