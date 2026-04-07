import { FormIdentifier } from "@/interfaces";
import { INavigateActoinArguments, IRouter } from ".";
import { isFormFullName } from "../form/utils";
import { mapKeyValueToDictionary } from "@/utils/dictionary";
import { buildUrl } from "@/utils/url";
import { IKeyValue } from "@/interfaces/keyValue";
import { IShaRouter } from "./contexts";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

const LOGGED_IN_DYNAMIC_PAGE = 'dynamic';
const ANONYMOUS_DYNAMIC_PAGE = 'no-auth';

type FormUrlEvaluator = (formId: FormIdentifier, isLoggedIn: boolean) => string;
type StringConverterFunc = (value: string) => string;

export type ShaRouterArgs = {
  router: IRouter;
  getFormUrlFunc?: FormUrlEvaluator | undefined;
  getIsLoggedIn: () => boolean;
  urlOverrideFunc?: StringConverterFunc | undefined;
};

export class ShaRouter implements IShaRouter {
  private _router: IRouter;

  private _getFormUrlFunc?: FormUrlEvaluator | undefined;

  private _getIsLoggedIn: () => boolean;

  private _urlOverrideFunc?: StringConverterFunc | undefined;

  private _navigationValidators: Array<(url: string) => Promise<boolean>> = [];

  get router(): IRouter {
    return this._router;
  }

  constructor(args: ShaRouterArgs) {
    this._router = args.router;
    this._getFormUrlFunc = args.getFormUrlFunc;
    this._getIsLoggedIn = args.getIsLoggedIn;
    this._urlOverrideFunc = args.urlOverrideFunc;
  }

  prepareUrl = (url: string): string => {
    return this._urlOverrideFunc
      ? this._urlOverrideFunc(url)
      : url;
  };

  validateNavigation = async (url: string): Promise<boolean> => {
    for (const validator of this._navigationValidators) {
      const allowed = await validator(url);
      if (!allowed)
        return false;
    }
    return true;
  };

  registerNavigationValidator(validator: (url: string) => Promise<boolean>): () => void {
    this._navigationValidators.push(validator);
    return () => this._navigationValidators = this._navigationValidators.filter((v) => v !== validator);
  }

  updateRouter(args: ShaRouterArgs): void {
    this._router = args.router;
    this._getFormUrlFunc = args.getFormUrlFunc;
    this._getIsLoggedIn = args.getIsLoggedIn;
    this._urlOverrideFunc = args.urlOverrideFunc;
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

  private _buildFinalUrl = (url: string, queryParameters?: IKeyValue[]): string => {
    const queryParams = mapKeyValueToDictionary(queryParameters);
    const fullUrl = buildUrl(url, queryParams);
    return this.prepareUrl(fullUrl);
  };

  getUrlFromNavigationRequest = (request: INavigateActoinArguments): string | undefined => {
    switch (request.navigationType) {
      case 'url': return !isNullOrWhiteSpace(request.url)
        ? this._buildFinalUrl(request.url, request.queryParameters)
        : undefined;
      case 'form': {
        if (!isDefined(request.formId))
          return undefined;
        const formUrl = this.getFormUrl(request.formId);
        return this._buildFinalUrl(formUrl, request.queryParameters);
      }
      default: return undefined;
    }
  };
}
