import { FormIdentifier } from "@/interfaces";
import { INavigateActoinArguments, IRouter } from ".";
import { isFormFullName } from "../form/utils";
import { mapKeyValueToDictionary } from "@/utils/dictionary";
import { buildUrl } from "@/utils/url";
import { IKeyValue } from "@/interfaces/keyValue";
import { IShaRouter } from "./contexts";

const LOGGED_IN_DYNAMIC_PAGE = 'dynamic';
const ANONYMOUS_DYNAMIC_PAGE = 'no-auth';

type FormUrlEvaluator = (formId: FormIdentifier, isLoggedIn: boolean) => string;

export type ShaRouterArgs = {
  router: IRouter;
  getFormUrlFunc?: FormUrlEvaluator | undefined;
  getIsLoggedIn: () => boolean;
};

export class ShaRouter implements IShaRouter {
  private _router: IRouter;

  private _getFormUrlFunc?: (formId: FormIdentifier, isLoggedIn: boolean) => string;

  private _getIsLoggedIn: () => boolean;

  get router(): IRouter {
    return this._router;
  }

  constructor(args: ShaRouterArgs) {
    this._router = args.router;
    this._getFormUrlFunc = args.getFormUrlFunc;
    this._getIsLoggedIn = args.getIsLoggedIn;
  }

  updateRouter(args: ShaRouterArgs): void {
    this._router = args.router;
    this._getFormUrlFunc = args.getFormUrlFunc;
    this._getIsLoggedIn = args.getIsLoggedIn;
  }

  goingToRoute = (route: string): Promise<boolean> => {
    this._router.push(route);
    return Promise.resolve(true);
  };

  getFormUrl = (formId: FormIdentifier): string => {
    const isLoggedIn = this._getIsLoggedIn();
    if (this._getFormUrlFunc)
      return this._getFormUrlFunc(formId, isLoggedIn);

    const dynamicPage = isLoggedIn
      ? LOGGED_IN_DYNAMIC_PAGE
      : ANONYMOUS_DYNAMIC_PAGE;

    return isFormFullName(formId)
      ? `/${dynamicPage}${formId.module ? `/${formId.module}` : ''}/${formId.name}`
      : '';
  };

  private _prepareUrl = (url: string, queryParameters?: IKeyValue[]): string => {
    const queryParams = mapKeyValueToDictionary(queryParameters);
    return buildUrl(url, queryParams);
  };

  getUrlFromNavigationRequest = (request: INavigateActoinArguments): string => {
    switch (request?.navigationType) {
      case 'url': return this._prepareUrl(request.url, request.queryParameters);
      case 'form': {
        const formUrl = this.getFormUrl(request.formId);
        return this._prepareUrl(formUrl, request.queryParameters);
      }
      default: return undefined;
    }
  };
}
