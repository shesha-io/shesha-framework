
import { IFormPersisterActionsContext, IFormPersisterStateContext, ILoadFormPayload } from "./contexts";
import { IFormManagerActionsContext } from "../formManager/contexts";
import { UpToDateForm } from "../formManager/interfaces";
import { FormIdentifier, FormMarkupWithSettings, IFormSettings, toErrorInfo } from "@/interfaces";
import { HttpClientApi } from "../sheshaApplication/publicApi";
import { FormUpdateMarkupInput } from "@/apis/formConfiguration";

type ForceUpdateTrigger = () => void;

type FormPersisterArguments = {
  formManager: IFormManagerActionsContext;
  formId: FormIdentifier;
  forceRootUpdate: ForceUpdateTrigger;
  httpClient: HttpClientApi;
};

const URLS = {
  SAVE_FORM: '/api/services/Shesha/FormConfiguration/UpdateMarkup',
};

export class FormPersister implements IFormPersisterActionsContext {
  state: IFormPersisterStateContext;

  private formManager: IFormManagerActionsContext;

  private httpClient: HttpClientApi;

  private forceRootUpdate: ForceUpdateTrigger;

  constructor(args: FormPersisterArguments) {
    this.formManager = args.formManager;
    this.httpClient = args.httpClient;
    this.forceRootUpdate = args.forceRootUpdate;
    this.state = {
      formId: args.formId,
      formProps: null,
      loaded: false,
      loading: false,
      saved: false,
      saving: false,
    };
    this.loadForm({ skipCache: false }).catch(() => {
      // noop
    });
  }

  setState = (updater: (prev: IFormPersisterStateContext) => IFormPersisterStateContext): void => {
    this.state = updater(this.state);
    this.forceRootUpdate();
  };

  loadForm = async (payload: ILoadFormPayload): Promise<UpToDateForm> => {
    this.setState((s) => ({ ...s, loading: true, loadError: undefined }));

    try {
      const config = await this.formManager.getFormById({ formId: this.state.formId, skipCache: payload.skipCache });

      this.setState((s) => ({
        ...s,
        loading: false,
        loaded: true,
        loadError: undefined,
        formProps: config,
      }));

      return config;
    } catch (error) {
      this.setState((s) => ({ ...s, loading: false, loaded: false, loadError: toErrorInfo(error) }));
      throw error;
    }
  };

  saveForm = async (payload: FormMarkupWithSettings): Promise<void> => {
    this.setState((s) => ({ ...s, saving: true, saved: false, saveError: undefined }));

    try {
      const formId = this.state.formProps?.id;
      if (!formId)
        throw new Error('Form identifier is not defined');

      const dto: FormUpdateMarkupInput = {
        id: formId,
        markup: JSON.stringify(payload),
        access: payload.formSettings.access,
        permissions: payload.formSettings.permissions,
      };
      await this.httpClient.put(URLS.SAVE_FORM, dto);

      this.setState((s) => ({
        ...s,
        saving: false,
        saved: true,
        saveError: undefined,
      }));
    } catch (error) {
      this.setState((s) => ({ ...s, saving: false, saved: false, saveError: toErrorInfo(error) }));
      throw error;
    }
  };

  updateFormSettings = (settings: IFormSettings): void => {
    if (this.state.formProps) {
      const formProps = { ...this.state.formProps, settings };
      this.setState((s) => ({ ...s, formProps }));
    }
  };
}
