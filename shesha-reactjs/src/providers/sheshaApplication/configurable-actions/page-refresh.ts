import { useSheshaApplication } from "../../..";
import { useConfigurableAction } from "../../configurableActionsDispatcher";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";

export const usePageRefreshAction = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  useConfigurableAction({
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'Refresh Page',
    hasArguments: true,
    executer: (_actionArgs, _context) => {
      return Promise.reject('not implemented');
    }
  }, [backendUrl, httpHeaders]);
};
