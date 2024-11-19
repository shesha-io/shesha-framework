import qs from "qs";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { FormsManager } from "./manager";
import { AxiosResponse } from "axios";
import { IAbpWrappedGetEntityResponse } from "@/interfaces/gql";
import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { nanoid } from "@/utils/uuid";

export interface IFormsApi {
  /**
   * Prepare form markup using form template
   */
  prepareTemplateAsync: (templateId: string, replacements: object) => Promise<string>;
}

/**
 * Forms API.
 */
export class FormsApi implements IFormsApi {
  readonly _formsManager: FormsManager;
  readonly _httpClient: HttpClientApi;


  constructor(httpClient: HttpClientApi) {
    this._formsManager = new FormsManager(httpClient);
    this._httpClient = httpClient;
  }

  prepareTemplateAsync = (templateId: string, replacements: object): Promise<string> => {
    if (!templateId)
      return Promise.resolve(null);

    const payload = {
      id: templateId,
      properties: 'markup',
    };
    const url = `/api/services/Shesha/FormConfiguration/Query?${qs.stringify(payload)}`;
    return this._httpClient
      .get<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url)
      .then((response) => {
        const markup = response.data.result.markup;

        const preparedMarkup = evaluateString(markup, {
          NEW_KEY: nanoid(),
          GEN_KEY: nanoid(),
          ...(replacements ?? {}),
        }, true);

        return preparedMarkup;
      });
  };
}