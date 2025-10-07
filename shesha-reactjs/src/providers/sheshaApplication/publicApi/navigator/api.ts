import { FormIdentifier } from "@/interfaces";
import { ShaRouting } from "@/providers/shaRouting/contexts";
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
}

export class NavigatorApi implements INavigatorApi {
  #shaRouter: ShaRouting;

  constructor(shaRouter: ShaRouting) {
    this.#shaRouter = shaRouter;
  }

  navigateToUrl = (url: string, queryParameters?: Record<string, string>): void => {
    const finalUrl = buildUrl(url, queryParameters);
    this.#shaRouter.goingToRoute(finalUrl);
  };

  navigateToForm = (formId: FormIdentifier, args?: Record<string, string>): void => {
    const url = this.getFormUrl(formId);
    this.navigateToUrl(url, args);
  };

  getFormUrl = (formId: FormIdentifier): string => {
    return this.#shaRouter.getFormUrl(formId);
  };
}
