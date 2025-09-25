import { useAuthOrUndefined, useSheshaApplication } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { ILoginForm } from '@/interfaces/loginForm';

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
      executer: (_, actionContext) => {
        if (!auth)
          throw new Error("Authentication is not available");

        const data = actionContext?.form?.data as ILoginForm;
        return auth.loginUserAsync(data);
      },
    },
    [backendUrl, httpHeaders]
  );
};
