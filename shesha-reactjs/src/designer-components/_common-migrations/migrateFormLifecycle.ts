import { IFormLifecycleSettings, IFormSettings } from "@/interfaces";
import { GqlLoaderSettings } from "@/providers/form/loaders/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";

export const migrateFormLifecycle = (settings: IFormSettings): IFormSettings => {
    const {
        fieldsToFetch,
        excludeFormFieldsInPayload,

        postUrl,
        putUrl,
        deleteUrl,
        getUrl,

        initialValues,
        preparedValues,
        onInitialized,
        onDataLoaded,
        onUpdate,
        ...restSettings
    } = settings;

    /*
    load/submit settings
    */
    const normalizeUrl = (value: string): string => {
        const result = value?.trim();
        return result ? result : undefined;
    };
    const urls = {
        update: normalizeUrl(putUrl),
        create: normalizeUrl(postUrl),
    };

    const gqlLoaderSettings: GqlLoaderSettings = {
        //url: getUrl,
        fieldsToFetch,
        endpointType: Boolean(getUrl) ? 'static' : 'default',
        staticEndpoint: Boolean(getUrl) ? { httpVerb: 'get', url: getUrl } : undefined,
    };

    const getDynamicSubmitEndpoint = (createUrl: string, updateUrl: string): string => {
        const createUrlExpression = createUrl ? `{ httpVerb: 'POST', url: "${createUrl}" }` : 'form.defaultEndpoints.create';
        const updateUrlExpression = updateUrl ? `{ httpVerb: 'PUT', url: "${updateUrl}" }` : 'form.defaultEndpoints.update';

        return `    console.log('LOG: GET dynamic endpoint');
    return data?.id ? ${updateUrlExpression} : ${createUrlExpression}`;
        return `    return data?.id ? ${updateUrlExpression} : ${createUrlExpression}`;
    };
    const gqlSubmitterSettings: GqlSubmitterSettings = {
        excludeFormFields: excludeFormFieldsInPayload,
        endpointType: !Boolean(urls.create) && !Boolean(urls.update) ? 'default' : 'dynamic',
        staticEndpoint: undefined,
        dynamicEndpoint: getDynamicSubmitEndpoint(urls.create, urls.update),
    };
    const lifecycleSettings: IFormLifecycleSettings = {
        dataLoaderType: 'gql',
        dataLoadersSettings: {
            'gql': gqlLoaderSettings,
        },

        dataSubmitterType: 'gql',
        dataSubmittersSettings: {
            'gql': gqlSubmitterSettings,
        },

        onBeforeShow: onInitialized,
        onAfterShow: onDataLoaded,

        onValuesChanged: onUpdate,

        onBeforeSubmit: null,
        onSubmitSuccess: null,
        onSubmitFailed: null,
    };

    const result: IFormSettings = {
        ...restSettings,
        ...lifecycleSettings,
    };

    return result;
};