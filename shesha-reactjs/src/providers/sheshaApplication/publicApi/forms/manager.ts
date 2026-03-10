import { HttpClientApi } from "@/publicJsApis/httpClient";

export class FormsManager {
  readonly _httpClient: HttpClientApi;

  constructor(httpClient: HttpClientApi) {
    this._httpClient = httpClient;
  }
}
