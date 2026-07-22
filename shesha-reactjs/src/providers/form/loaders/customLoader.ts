import { IFormSettings } from "@/interfaces";
import { CustomLoaderSettings, FormDataLoadingPayload, IFormDataLoader, isCustomLoaderSettings } from "./interfaces";
import { extractErrorInfo } from "@/utils/errors";

export class CustomLoader<Values extends object = object> implements IFormDataLoader<Values> {
  #getLoaderSettings = (formSettings: IFormSettings): CustomLoaderSettings => {
    const { dataLoadersSettings = {} } = formSettings;
    const loaderSettings = dataLoadersSettings['custom'];
    return isCustomLoaderSettings(loaderSettings) ? loaderSettings : { onDataLoad: '' };
  };

  canLoadData = (_formArguments: object | undefined): boolean => true;

  loadAsync = async (payload: FormDataLoadingPayload): Promise<Values | undefined> => {
    const { loadingCallback, formSettings, expressionExecuter } = payload;

    loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching data...' });

    const settings = this.#getLoaderSettings(formSettings);

    try {
      const response = await expressionExecuter(settings.onDataLoad, payload) as Values;

      loadingCallback?.({ loadingState: 'ready', loaderHint: undefined });

      return response;
    } catch (error) {
      loadingCallback?.({ loadingState: 'failed', error: extractErrorInfo(error) });
      return undefined;
    }
  };
}
