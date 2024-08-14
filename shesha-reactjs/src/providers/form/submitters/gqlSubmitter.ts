import { HttpClientApi, useHttpClient } from "@/providers/sheshaApplication/publicApi";
import { FormDataSubmitPayload, GqlSubmitterSettings, IFormDataSubmitter, isGqlSubmitterSettings } from "./interfaces";
import { useState } from "react";
import { IApiEndpoint, IFormSettings } from "@/interfaces";
import { StandardEntityActions } from "@/interfaces/metadata";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { getQueryParams, getUrlWithoutQueryParams } from "@/utils/url";
import qs from "qs";
import { unwrapAxiosCall } from "@/providers/sheshaApplication/publicApi/http/httpUtils";
import { unwrapAbpResponse } from "@/utils/fetchers";
import { HttpResponse } from "@/providers/sheshaApplication/publicApi/http/api";
import { addFormFieldsList, hasFiles, jsonToFormData, removeGhostKeys } from "@/utils/form";

export interface GqlSubmitterArguments {
    httpClient: HttpClientApi;
    endpointsEvaluator: IEntityEndpointsEvaluator;
}

export class GqlSubmitter implements IFormDataSubmitter {
    #httpClient: HttpClientApi;
    #endpointsEvaluator: IEntityEndpointsEvaluator;
    //private 

    constructor(args: GqlSubmitterArguments) {
        this.#httpClient = args.httpClient;
        this.#endpointsEvaluator = args.endpointsEvaluator;
        /*
        this.#metadataDispatcher = args.metadataDispatcher;
        this.#toolboxComponents = args.toolboxComponents;
        

        this.formSettings = args.formSettings;
        this.formFlatStructure = args.formFlatStructure;
        */
        if (!this.#httpClient)
            throw new Error("Http client is mandatory");
    }

    #getGqlSettings = (formSettings: IFormSettings): GqlSubmitterSettings => {
        const { dataSubmittersSettings = {} } = formSettings;
        const submitterSettings = dataSubmittersSettings?.['gql'];
        return isGqlSubmitterSettings(submitterSettings) ? submitterSettings : { endpointType: 'default' };
    };

    /*
    #getDynamicPreparedValues = async (payload: FormDataSubmitPayload): Promise<object> => {
        if (!payload.formSettings.onBeforeSubmit)
            return {};

        const data = await payload.expressionExecuter(payload.formSettings.onBeforeSubmit, undefined);
        return data;
    };
    */

    prepareDataForSubmit = async (payload: FormDataSubmitPayload): Promise<any> => {
        console.log('LOG: prepareDataForSubmit', payload);

        const { formSettings, data, antdForm, getDelayedUpdates } = payload;
        const settings = this.#getGqlSettings(formSettings);

        const postData = {...data};

        const postDataAfterPreparation = payload.onPrepareSubmitData
            ? await payload.onPrepareSubmitData({ data: postData })
            : postData;
        
        // handle formFields
        const postDataWithServiceFields = settings.excludeFormFields
            ? postDataAfterPreparation
            : addFormFieldsList({}, postDataAfterPreparation, antdForm);

        // handle delayed updates
        console.log('LOG: getDelayedUpdates');
        if (Boolean(getDelayedUpdates)) 
            postDataWithServiceFields._delayedUpdate = getDelayedUpdates();
        console.log('LOG: getDelayedUpdates - ok', postDataWithServiceFields._delayedUpdate);

        const postDataWithoutGhosts = removeGhostKeys(postDataWithServiceFields);

        const postDataFinal = data && hasFiles(postDataWithoutGhosts) 
            ? jsonToFormData(postDataWithoutGhosts) 
            : postDataWithoutGhosts;

        return postDataFinal;
    };

    #getHttpCaller = (endpoint: IApiEndpoint): (data: any) => Promise<any> => {
        const normalizedVerb = endpoint.httpVerb?.trim()?.toLowerCase();

        const unwrapHttpCall = <Response = any>(promise: Promise<HttpResponse<Response>>) => {
            return unwrapAxiosCall(promise).then(unwrapAbpResponse);
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
                console.log('LOG: dynamicEvaluated', dynamicEvaluated);                
                return dynamicEvaluated;
            }
            default:
                return null;
        }
    };

    submitAsync = async (payload: FormDataSubmitPayload): Promise<any> => {
        /*
         data preparation:
         1. skip initial values, it should be part of data already
         2. instead of Prepared Values call new Before Submit event
         3. convert to FormData if required (part of caller)
        */
        const data = await this.prepareDataForSubmit(payload);

        const { onBeforeSubmit, onSubmitSuccess, onSubmitFailed } = payload;

        const entityAction = data?.id
            ? StandardEntityActions.update
            : StandardEntityActions.create;
        const endpoint = await this.getEndpointAsync(payload, entityAction);

        if (onBeforeSubmit)
            await onBeforeSubmit(data);

        const httpCaller = this.#getHttpCaller(endpoint);

        try {
            const response = await httpCaller(data);
            
            if (onSubmitSuccess)
                await onSubmitSuccess();

            return response;
        } catch(error){
            if (onSubmitFailed)
                await onSubmitFailed();
            throw error;
        }
    };
}

export const useGqlSubmitter = (): IFormDataSubmitter => {
    const httpClient = useHttpClient();
    const endpointsEvaluator = useModelApiHelper();
    // const metadataDispatcher = useMetadataDispatcher();
    // const toolboxComponents = useFormDesignerComponents();

    const [loader] = useState<IFormDataSubmitter>(() => {
        return new GqlSubmitter({
            httpClient: httpClient,
            endpointsEvaluator: endpointsEvaluator,
            // metadataDispatcher: metadataDispatcher,
            // toolboxComponents: toolboxComponents,
        });
    });
    return loader;
};