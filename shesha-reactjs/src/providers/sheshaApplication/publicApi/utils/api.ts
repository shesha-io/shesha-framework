import { evaluateString } from "@/providers/form/utils";
import { HttpClientApi } from "../http/api";

export interface IUtilsApi {
    evaluateString: (template: string, data: any) => string;
}

/**
 * Utils API.
 */
export class UtilsApi implements IUtilsApi {
    readonly _httpClient: HttpClientApi;

    constructor(httpClient: HttpClientApi) {
        this._httpClient = httpClient;
    }

    evaluateString = (template: string, data: any) => {
        return evaluateString(template, data);
    };
}