import { IFormLifecycleSettings, IFormSettings } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";
import { GqlLoaderSettings } from "@/providers/form/loaders/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";
import { extractJsFieldFromKeyValue } from "./keyValueUtils";

const getPrepareSubmitData = (preparedValues: string): string => {
    const normalizedPreparedValues = (preparedValues ?? "").trim();
    if (!normalizedPreparedValues)
        return null;

    return `    const preparedValues = () => {
    ${normalizedPreparedValues}
    };
    return { ..data, ...preparedValues() };`;
};

const getBeforeDataLoaded = (onInitialized: string): string => {
    let result = `    form.setFieldsValue({...form.formArguments});`;
    const normalizedJs = onInitialized?.trim();
    if (normalizedJs)
        result += `    ${normalizedJs}`;
    return result;
};

const getAfterDataLoaded = (onDataLoaded: string, initialValues?: IKeyValue[]): string => {
    if (!initialValues || initialValues.length === 0)
        return null;
    
    let result = "    const initialValues = {\r\n";
    initialValues.forEach(item => {
        if (item.key) {
            const value = extractJsFieldFromKeyValue(item.value?.trim());
            const currentPropLine = `        ${item.key}: ${value},\r\n`;
            result += currentPropLine;
        }
    });
    result += "    };\r\n";
    result += "    form.setFieldsValue(initialValues);";

    const normalizedJs = onDataLoaded?.trim();
    if (normalizedJs)
        result += `    ${normalizedJs}`;    

    return result;
};

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

        onBeforeShow: getBeforeDataLoaded(onInitialized),
        onAfterShow: getAfterDataLoaded(onDataLoaded),

        onValuesChanged: onUpdate,

        onPrepareSubmitData: getPrepareSubmitData(preparedValues),
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