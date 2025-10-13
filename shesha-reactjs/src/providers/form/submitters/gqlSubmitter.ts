import { HttpClientApi, useHttpClient } from "@/providers/sheshaApplication/publicApi";
import { FormDataSubmitPayload, GqlSubmitterSettings, IFormDataSubmitter, isGqlSubmitterSettings, SubmitCaller } from "./interfaces";
import { useState } from "react";
import { IAjaxResponse, IApiEndpoint, IFormSettings, IToolboxComponents } from "@/interfaces";
import { StandardEntityActions } from "@/interfaces/metadata";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { getQueryParams, getUrlWithoutQueryParams } from "@/utils/url";
import qs from "qs";
import { unwrapAxiosCall } from "@/providers/sheshaApplication/publicApi/http/httpUtils";
import { unwrapAbpResponse } from "@/utils/fetchers";
import { HttpResponse } from "@/publicJsApis/httpClient";
import { addFormFieldsList, hasFiles, jsonToFormData, removeGhostKeys } from "@/utils/form";
import { useFormDesignerComponents } from "../hooks";

export interface GqlSubmitterArguments {
  httpClient: HttpClientApi;
  endpointsEvaluator: IEntityEndpointsEvaluator;
  toolboxComponents: IToolboxComponents;
}

export class GqlSubmitter implements IFormDataSubmitter {
  #httpClient: HttpClientApi;

  #endpointsEvaluator: IEntityEndpointsEvaluator;
  // #toolboxComponents: IToolboxComponents;


  constructor(args: GqlSubmitterArguments) {
    this.#httpClient = args.httpClient;
    this.#endpointsEvaluator = args.endpointsEvaluator;
    // this.#toolboxComponents = args.toolboxComponents;

    if (!this.#httpClient)
      throw new Error("Http client is mandatory");
  }

  #getGqlSettings = (formSettings: IFormSettings): GqlSubmitterSettings => {
    const { dataSubmittersSettings = {} } = formSettings;
    const submitterSettings = dataSubmittersSettings?.['gql'];
    return isGqlSubmitterSettings(submitterSettings) ? submitterSettings : { endpointType: 'default' };
  };

  prepareDataForSubmit = async (payload: FormDataSubmitPayload): Promise<any> => {
    const { formSettings, data, antdForm, getDelayedUpdates } = payload;
    const settings = this.#getGqlSettings(formSettings);

    const postData = removeGhostKeys({ ...data });

    const postDataAfterPreparation = payload.onPrepareSubmitData
      ? await payload.onPrepareSubmitData({ data: postData })
      : postData;

    // handle formFields
    const postDataWithServiceFields = settings.excludeFormFields
      ? postDataAfterPreparation
      : addFormFieldsList({}, postDataAfterPreparation, antdForm);

    // handle delayed updates
    if (Boolean(getDelayedUpdates))
      postDataWithServiceFields._delayedUpdate = getDelayedUpdates();

    const postDataFinal = data && hasFiles(postDataWithServiceFields)
      ? jsonToFormData(postDataWithServiceFields)
      : postDataWithServiceFields;

    return postDataFinal;
  };

  #getHttpCaller = (endpoint: IApiEndpoint): SubmitCaller => {
    const normalizedVerb = endpoint.httpVerb?.trim()?.toLowerCase();

    // TResponse extends any, TData extends any
    const unwrapHttpCall = <TData extends any, TResponse extends TData | IAjaxResponse<TData>>(promise: Promise<HttpResponse<TResponse>>): Promise<TData | TResponse> => {
      const axiosUnwrapped = unwrapAxiosCall(promise);
      return axiosUnwrapped.then((response) => unwrapAbpResponse<TData, TResponse>(response));
    };

    switch (normalizedVerb) {
      case "post":
        return (data) => {
          return unwrapHttpCall(this.#httpClient.post(endpoint.url, data));
        };
      case "put":
        return (data) => {
          return unwrapHttpCall(this.#httpClient.put(endpoint.url, data));
        };
      case "delete":
        return (data) => {
          const urlWithoutQuery = getUrlWithoutQueryParams(endpoint.url);
          const queryParams = getQueryParams(endpoint.url);
          const queryStringData = { ...queryParams, ...data };
          const finalUrl = `${urlWithoutQuery}?${qs.stringify(queryStringData)}`;

          return unwrapHttpCall(this.#httpClient.delete(finalUrl));
        };
      default:
        return null;
    }
  };

  getEndpointAsync = async (payload: FormDataSubmitPayload, entityAction: StandardEntityActions): Promise<IApiEndpoint> => {
    const { formSettings } = payload;
    const gqlSettings = this.#getGqlSettings(formSettings);
    const { endpointType, staticEndpoint, dynamicEndpoint } = gqlSettings;

    switch (endpointType) {
      case 'default': {
        return await this.#endpointsEvaluator.getFormActionUrl({ actionName: entityAction, formSettings: formSettings, mappings: [] });
      }
      case 'static': {
        return staticEndpoint;
      }
      case 'dynamic': {
        const dynamicEvaluated = await payload.expressionExecuter(dynamicEndpoint, { data: payload.data });
        return dynamicEvaluated;
      }
      default:
        return null;
    }
  };

  submitAsync = async (payload: FormDataSubmitPayload): Promise<any> => {
    const data = await this.prepareDataForSubmit(payload);

    const { onBeforeSubmit, onSubmitSuccess, onSubmitFailed, customSubmitCaller } = payload;

    if (onBeforeSubmit)
      await onBeforeSubmit({ data: removeGhostKeys({ ...data }) });

    const getDefaultSubmitCaller = async (): Promise<SubmitCaller> => {
      const entityAction = data?.id
        ? StandardEntityActions.update
        : StandardEntityActions.create;
      const endpoint = await this.getEndpointAsync(payload, entityAction);
      return this.#getHttpCaller(endpoint);
    };

    const submitCaller = customSubmitCaller ?? await getDefaultSubmitCaller();

    try {
      const response = await submitCaller(data);

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

export const useGqlSubmitter = (): IFormDataSubmitter => {
  const httpClient = useHttpClient();
  const endpointsEvaluator = useModelApiHelper();
  const toolboxComponents = useFormDesignerComponents();

  const [loader] = useState<IFormDataSubmitter>(() => {
    return new GqlSubmitter({
      httpClient: httpClient,
      endpointsEvaluator: endpointsEvaluator,
      toolboxComponents: toolboxComponents,
    });
  });
  return loader;
};
