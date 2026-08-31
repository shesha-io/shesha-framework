import { useAuthOrUndefined, useSheshaApplication } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { isLoginFormData } from '@/interfaces/loginForm';

export const useExecuteSignIn = (): void => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const auth = useAuthOrUndefined();

  useConfigurableAction(
    {
      name: 'Sign In',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      sortOrder: 8,
      hasArguments: false,
      executer: async (_, actionContext) => {
        if (!auth)
          throw new Error("Authentication is not available");

        const formInstance = actionContext.form?.formInstance;
        if (formInstance)
          await formInstance.validateFields();

        if (isLoginFormData(actionContext.form?.data))
          return auth.loginUserAsync(actionContext.form.data);

        throw new Error("Login data is not valid");
      },
    },
    [backendUrl, httpHeaders],
  );
};
