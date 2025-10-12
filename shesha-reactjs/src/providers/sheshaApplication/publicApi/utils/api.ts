import { evaluateString } from "@/providers/form/utils";
import { HttpClientApi } from "@/publicJsApis/httpClient";

export interface IUtilsApi {
  evaluateString: (template: string, data: object) => string;
}

/**
 * Utils API.
 */
export class UtilsApi implements IUtilsApi {
  readonly _httpClient: HttpClientApi;

  constructor(httpClient: HttpClientApi) {
    this._httpClient = httpClient;
  }

  evaluateString = (template: string, data: object): string => {
    return evaluateString(template, data);
  };
}
