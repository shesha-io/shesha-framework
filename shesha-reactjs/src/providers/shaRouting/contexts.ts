import { FormIdentifier, INavigateActoinArguments, IRouter } from '@/providers';
import { createNamedContext } from '@/utils/react';

export interface IShaRoutingStateContext {
  readonly router: IRouter;
}

export interface IShaRoutingActionsContext {
  /**
   * Navigate to the specified route
   */
  goingToRoute: (route: string) => Promise<boolean>;

  /**
   * Get dynamic page url for the specified form
   * @param formId form identifier
   * @returns url to the dynamic page (e.g. '/dynamic/moduleName/formName' or '/no-auth/moduleName/formName')
   */
  getFormUrl: (formId: FormIdentifier) => string;

  /**
   * Get url from navigation request
   */
  getUrlFromNavigationRequest: (request: INavigateActoinArguments) => string;

  /**
   * Check if navigation to the url is allowed according to the current application state.
   * Can be used to prevent navigation when user has unsaved changes.
   * @param url url to navigate
   */
  validateNavigation(url: string): Promise<boolean>;

  /**
   * Register navigation validator.
   * Returns function that can be used to unregister validator.
   * @param validator Navigation validator. It should return true if navigation to url is allowed
   */
  registerNavigationValidator(validator: (url: string) => Promise<boolean>): () => void;
}

export type IShaRouter = IShaRoutingStateContext & IShaRoutingActionsContext;

export const ShaRouterContext = createNamedContext<IShaRouter>(undefined, "ShaRouterContext");
