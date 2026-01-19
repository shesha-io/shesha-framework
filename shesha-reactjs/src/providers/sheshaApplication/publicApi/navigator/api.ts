import { FormIdentifier } from "@/interfaces";
import { IShaRouter } from "@/providers/shaRouting/contexts";
import { buildUrl } from "@/utils/url";

export interface INavigatorApi {
  /**
   * Navigate to the given url
   */
  navigateToUrl: (url: string, queryParameters?: Record<string, string>) => void;
  /**
   * Navigate to the given form
   */
  navigateToForm: (formId: FormIdentifier, args?: Record<string, string>) => void;
  /**
   * Get form url
   */
  getFormUrl: (formId: FormIdentifier) => string;
  /**
   * Prepare url (apply conventions)
   */
  prepareUrl: (url: string) => string;
}

export class NavigatorApi implements INavigatorApi {
  #shaRouter: IShaRouter;

  constructor(shaRouter: IShaRouter) {
    this.#shaRouter = shaRouter;
  }

  prepareUrl = (url: string): string => this.#shaRouter.prepareUrl(url);

  navigateToUrl = (url: string, queryParameters?: Record<string, string>): void => {
    const urlWithQuery = buildUrl(url, queryParameters);
    const finalUrl = this.prepareUrl(urlWithQuery);
    void this.#shaRouter.goingToRoute(finalUrl);
  };

  navigateToForm = (formId: FormIdentifier, args?: Record<string, string>): void => {
    const url = this.getFormUrl(formId);
    this.navigateToUrl(url, args);
  };

  getFormUrl = (formId: FormIdentifier): string => {
    return this.#shaRouter.getFormUrl(formId);
  };
}
