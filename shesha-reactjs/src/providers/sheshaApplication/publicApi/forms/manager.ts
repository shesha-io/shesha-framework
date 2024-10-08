import { HttpClientApi } from "../http/api";

export class FormsManager {
    readonly _httpClient: HttpClientApi;

    constructor(httpClient: HttpClientApi) {
        this._httpClient = httpClient;
    }
}