import { IFormLifecycleSettings, IFormSettings } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";
import { GqlLoaderSettings } from "@/providers/form/loaders/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";
import { convertFormMarkupToFlatStructure } from "@/index";
import { IFormMigrationContext } from "./models";
import { setValueByPropertyName } from "@/utils/object";

const getPrepareSubmitData = (preparedValues: string): string => {
    const normalizedPreparedValues = (preparedValues ?? "").trim();
    if (!normalizedPreparedValues)
        return null;

    return `    const preparedValues = () => {
    ${normalizedPreparedValues}
    };
    return { ...data, ...preparedValues() };`;
};

const getBeforeDataLoad = (onInitialized: string): string => {
    let result = `    form.setFieldsValue({...form.formArguments});`;
    const normalizedJs = onInitialized?.trim();
    if (normalizedJs)
        result += `    ${normalizedJs}`;
    return result;
};

const getAfterDataLoad = (onDataLoaded: string, initialValues?: IKeyValue[]): string => {
    if (!initialValues || initialValues.length === 0)
        return null;

    // Convert to JSON 
    const initialData = {};
    const initValues = [...initialValues, {key: "__shaFormData", value: 0}]
    initValues.forEach(item => {
        const value = typeof item.value === "string" && /{(.*?)}/gm.test(item.value)
          ? "'" + item.value.replaceAll("{", "' + ").replaceAll("}", " + '") + "'" // replace Mustache syntax if needed
          : item.value;
        setValueByPropertyName(initialData, item.key, value);
    });        
    const initialObjString = JSON.stringify(initialData, null, 4)
        .replaceAll("\"'' + ", "").replaceAll(" + ''\"", "")
        .replaceAll("\"'", "'").replaceAll("'\"", "'")
        .replace("\"__shaFormData\": 0", "...form.data"); // add loaded form data

    let result = '\r\n// Migrated from Initial Values and components defaults\r\n';
    result += `const initialData = ${initialObjString};\r\n`;
    result += 'form.setFieldsValue(initialData);\r\n';
    result += '// ----------------------------------------------------\r\n\r\n';

    const normalizedJs = onDataLoaded?.trim();
    if (normalizedJs)
        result += `    ${normalizedJs}`;    

    return result;
};

export const migrateDefaults = (settings: IFormSettings, context: IFormMigrationContext) => {
    const initialData: IKeyValue[] = [];
    const flatStructure = convertFormMarkupToFlatStructure(context.form.markup, settings, context.designerComponents);
    for(const id in flatStructure.allComponents) {
        if (!flatStructure.allComponents.hasOwnProperty(id)) continue;
        const component = flatStructure.allComponents[id];
        if (component.defaultValue !== undefined)
            initialData.push({ key: component.propertyName, value: component.defaultValue });
        if (component['initialValue'] !== undefined)
            initialData.push({ key: component.propertyName, value: component['initialValue'] });
    }
    const onAfterDataLoad = getAfterDataLoad(settings.onAfterDataLoad, initialData);
    return { ...settings, onAfterDataLoad };
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

        onBeforeDataLoad: getBeforeDataLoad(onInitialized),
        onAfterDataLoad: getAfterDataLoad(onDataLoaded, initialValues),

        onValuesUpdate: onUpdate,

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