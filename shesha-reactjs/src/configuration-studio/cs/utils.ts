export class MutableApi<TApi> {
  private _api: TApi | undefined = undefined;

  setApi(api: TApi): void {
    this._api = api;
  }

  getApi(): TApi | undefined {
    return this._api;
  }
}
