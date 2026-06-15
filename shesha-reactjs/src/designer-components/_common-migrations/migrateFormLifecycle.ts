import { IFormLifecycleSettings, IFormSettings } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";
import { GqlLoaderSettings } from "@/providers/form/loaders/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";
import { IFormMigrationContext } from "./models";
import { setValueByPropertyName } from "@/utils/object";
import { convertFormMarkupToFlatStructure } from "@/providers/form/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

const getPrepareSubmitData = (preparedValues: string | undefined): string | null => {
  const normalizedPreparedValues = (preparedValues ?? "").trim();
  if (!normalizedPreparedValues)
    return null;

  return `    const preparedValues = () => {
    ${normalizedPreparedValues}
    };
    return { ...data, ...preparedValues() };`;
};

const getBeforeDataLoad = (onInitialized: string | undefined): string => {
  let result = `    form.setFieldsValue({...form.formArguments});`;
  const normalizedJs = onInitialized?.trim();
  if (normalizedJs)
    result += `    ${normalizedJs}`;
  return result;
};

const getAfterDataLoad = (onDataLoaded: string | undefined, initialValues?: IKeyValue[] | undefined): string | null => {
  if (!initialValues || initialValues.length === 0)
    return onDataLoaded || null;

  // Convert to JSON
  const initialData = {};
  const initValues = [...initialValues, { key: "__shaFormData", value: 0 }];
  let initialCount = 0;
  initValues.forEach((item) => {
    const value = typeof item.value === "string"
      ? item.value.toLowerCase().indexOf("return") !== -1
        ? `#(() => { ${item.value.split("\r\n").join("\r\n").replaceAll("'", "#'").replaceAll("\"", "#\"").trim()} })()#` // wrap in parentheses if needed
        : /{(.*?)}/gm.test(item.value)
          ? "'" + item.value.replaceAll("{", "' + ").replaceAll("}", " + '") + "'" // replace Mustache syntax if needed
          : item.value
      : item.value;
    if (value === undefined || value === null || value === "") return; // skip empty values
    setValueByPropertyName(initialData, item.key, value);
    initialCount++;
  });

  // If there is only one value (__shaFormData), just return initial onDataLoaded code
  if (initialCount === 1)
    return onDataLoaded || null;

  const initialObjString = JSON.stringify(initialData, null, 4)
    .replaceAll("\"#", "").replaceAll("#\"", "").replaceAll("#\\\"", "\"")
    .replaceAll("\"'' + ", "").replaceAll(" + ''\"", "")
    .replaceAll("\"'", "'").replaceAll("'\"", "'")
    .replace("\"__shaFormData\": 0", "...form.data"); // add loaded form data

  let result = '\r\n// Migrated from Initial Values and components defaults\r\n';
  result += `const initialData = ${initialObjString};\r\n`.split("\\r\\n").join("\r\n");
  result += 'form.setFieldsValue(initialData);\r\n';
  result += '// ----------------------------------------------------\r\n\r\n';

  const normalizedJs = onDataLoaded?.trim();
  if (normalizedJs)
    result += `    ${normalizedJs}`;

  return result;
};

export const migrateDefaults = (settings: IFormSettings, context: IFormMigrationContext): IFormSettings => {
  if (!context.form.markup)
    return settings;

  const initialData: IKeyValue[] = [];
  const flatStructure = convertFormMarkupToFlatStructure(context.form.markup, settings, context.designerComponents);
  for (const id in flatStructure.allComponents) {
    if (!flatStructure.allComponents.hasOwnProperty(id)) continue;
    const component = flatStructure.allComponents[id];

    if (isDefined(component) && typeof (component) === "object" && "propertyName" in component && !isNullOrWhiteSpace(component.propertyName)) {
      if ('defaultValue' in component && typeof (component.defaultValue) === 'string')
        initialData.push({ key: component.propertyName, value: component.defaultValue });

      if ("initialValue" in component && typeof (component.initialValue) === 'string')
        initialData.push({ key: component.propertyName, value: component.initialValue });
    }
  }
  const onAfterDataLoad = getAfterDataLoad(settings.onAfterDataLoad, initialData);
  return { ...settings, onAfterDataLoad: onAfterDataLoad ?? undefined };
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
    onAfterDataLoad,
    onUpdate,
    ...restSettings
  } = settings;

  /*
    load/submit settings
    */
  const normalizeUrl = (value: string | undefined): string | undefined => {
    const result = value?.trim();
    return result ? result : undefined;
  };
  const urls = {
    update: normalizeUrl(putUrl),
    create: normalizeUrl(postUrl),
  };

  const gqlLoaderSettings: GqlLoaderSettings = {
    // url: getUrl,
    fieldsToFetch,
    endpointType: isNullOrWhiteSpace(getUrl) ? 'static' : 'default',
    staticEndpoint: !isNullOrWhiteSpace(getUrl) ? { httpVerb: 'get', url: getUrl } : undefined,
  };

  const getDynamicSubmitEndpoint = (createUrl: string | undefined, updateUrl: string | undefined): string => {
    const createUrlExpression = createUrl ? `{ httpVerb: 'POST', url: "${createUrl}" }` : 'form.defaultEndpoints.create';
    const updateUrlExpression = updateUrl ? `{ httpVerb: 'PUT', url: "${updateUrl}" }` : 'form.defaultEndpoints.update';

    return `    return data?.id ? ${updateUrlExpression} : ${createUrlExpression}`;
  };
  const gqlSubmitterSettings: GqlSubmitterSettings = {
    excludeFormFields: excludeFormFieldsInPayload,
    endpointType: isNullOrWhiteSpace(urls.create) && isNullOrWhiteSpace(urls.update) ? 'default' : 'dynamic',
    staticEndpoint: undefined,
    dynamicEndpoint: getDynamicSubmitEndpoint(urls.create, urls.update),
  };
  const lifecycleSettings: IFormLifecycleSettings = {
    dataLoaderType: 'gql',
    dataLoadersSettings: {
      gql: gqlLoaderSettings,
    },

    dataSubmitterType: 'gql',
    dataSubmittersSettings: {
      gql: gqlSubmitterSettings,
    },

    onBeforeDataLoad: getBeforeDataLoad(onInitialized),
    onAfterDataLoad: onAfterDataLoad || (getAfterDataLoad(onDataLoaded, initialValues) ?? undefined),

    onValuesUpdate: onUpdate,

    onPrepareSubmitData: getPrepareSubmitData(preparedValues) ?? undefined,
    onBeforeSubmit: undefined,
    onSubmitSuccess: undefined,
    onSubmitFailed: undefined,
  };

  const result: IFormSettings = {
    ...restSettings,
    ...lifecycleSettings,
  };

  return result;
};
