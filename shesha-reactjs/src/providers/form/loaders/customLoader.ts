import { IFormSettings } from "@/interfaces";
import { CustomLoaderSettings, FormDataLoadingPayload, IFormDataLoader, isCustomLoaderSettings } from "./interfaces";

export class CustomLoader implements IFormDataLoader {
  #getLoaderSettings = (formSettings: IFormSettings): CustomLoaderSettings => {
    const { dataLoadersSettings = {} } = formSettings;
    const loaderSettings = dataLoadersSettings?.['custom'];
    return isCustomLoaderSettings(loaderSettings) ? loaderSettings : { onDataLoad: '' };
  };

  canLoadData = (_formArguments: object): boolean => true;

  loadAsync = async (payload: FormDataLoadingPayload): Promise<any> => {
    const { loadingCallback, formSettings, expressionExecuter } = payload;

    loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching data...' });

    const settings = this.#getLoaderSettings(formSettings);

    try {
      const response = await expressionExecuter(settings.onDataLoad, payload);

      loadingCallback?.({ loadingState: 'ready', loaderHint: null });

      return response;
    } catch (error) {
      loadingCallback?.({ loadingState: 'failed', error: error });
      return undefined;
    }
  };
}
