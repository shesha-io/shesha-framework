import { removeGhostKeys } from "@/utils/form";
import { CustomSubmitterSettings, FormDataSubmitPayload, IFormDataSubmitter, isCustomSubmitterSettings } from "./interfaces";
import { IFormSettings } from "../models";
import { executeScript } from "../utils";

interface SubmitCallerArgs {
  data: any;
};

export class CustomSubmitter implements IFormDataSubmitter {
  #getSubmitterSettings = (formSettings: IFormSettings): CustomSubmitterSettings => {
    const { dataSubmittersSettings = {} } = formSettings;
    const submitterSettings = dataSubmittersSettings?.['custom'];
    return isCustomSubmitterSettings(submitterSettings) ? submitterSettings : { onSubmitData: '' };
  };

  submitAsync = async (payload: FormDataSubmitPayload): Promise<any> => {
    const { data } = payload;
    const submitData = removeGhostKeys(data);

    const { onBeforeSubmit, onSubmitSuccess, onSubmitFailed, formSettings } = payload;

    if (onBeforeSubmit)
      await onBeforeSubmit({ data: submitData });

    const settings = this.#getSubmitterSettings(formSettings);

    try {
      const submitCaller = settings.onSubmitData
        ? (args: SubmitCallerArgs) => {
          return executeScript(settings.onSubmitData, args);
        }
        : (args: SubmitCallerArgs): Promise<any> => {
          return Promise.resolve(args.data);
        };

      const response = await submitCaller({ data: submitData });

      if (onSubmitSuccess)
        await onSubmitSuccess();

      return response;
    } catch (error) {
      if (onSubmitFailed)
        await onSubmitFailed();
      throw error;
    }
  };
}
