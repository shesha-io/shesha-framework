import { useRef } from 'react';
import { nanoid } from '@/utils/uuid';
import { useSheshaApplication } from "@/providers";
import { useAvailableConstantsData, evaluateString, executeScript, genericActionArgumentsEvaluator } from '@/providers/form/utils';
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import axios, { Method } from 'axios';
import { IKeyValue } from "@/interfaces/keyValue";
import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import qs from "qs";
import { unwrapAbpResponse } from "@/utils/fetchers";
import { getQueryParams } from "@/utils/url";
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { FormMarkupFactory } from '@/interfaces/configurableAction';
import { IRequestParam, IRequestHeader, IRequestBody, IFormDataField, IResponseTransformationConfiguration, executeResponseTransformation } from '@/components/requestConfigModal';
import { IDictionary } from '@/interfaces';
import { IHasVersion } from '@/utils/fluentMigrator/migrator';

// Values are now plain strings (possibly containing {{ }} mustache). The generic evaluator has
// already resolved them before the executer runs. Legacy configs may still store an IPropertySetting
// object — handle that transparently so old configurations keep working.
const resolveRequestValue = (raw: unknown): string => {
  if (raw === null || raw === undefined || raw === '') return '';
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    return obj['_mode'] === 'code' ? String(obj['_code'] ?? '') : String(obj['_value'] ?? '');
  }
  return String(raw);
};

/** Shape of arguments before the migrator ran (no requestConfig). */
interface IApiCallArgumentsV0 extends IHasVersion {
  url: string;
  verb: string;
  parameters?: IKeyValue[];
  headers?: IKeyValue[];
  sendStandardHeaders: boolean;
}

export interface IApiCallArguments extends IHasVersion {
  url: string;
  verb: string;
  sendStandardHeaders: boolean;
  requestConfig?: {
    params?: IRequestParam[];
    headers?: IRequestHeader[];
    body?: IRequestBody;
    responseTransformation?: IResponseTransformationConfiguration;
  };
}

/** Migrate legacy parameters/headers into requestConfig based on HTTP verb. */
const migrateV0toV1 = (prev: IApiCallArgumentsV0): IApiCallArguments => {
  const { parameters, headers, verb, ...rest } = prev;

  const toParams = (items: IKeyValue[]): IRequestParam[] =>
    items.map((kv) => ({ key: kv.key, value: String(kv.value), enabled: true }));

  const toHeaders = (items: IKeyValue[]): IRequestHeader[] =>
    items.map((kv) => ({ key: kv.key, value: String(kv.value), enabled: true }));

  const safeParams = parameters ?? [];
  const safeHeaders = headers ?? [];
  const encodeAsQueryString = ['get', 'delete'].includes(((verb as unknown) ?? '').toString().toLowerCase());
  const migratedHeaders = toHeaders(safeHeaders);

  const requestConfig = encodeAsQueryString
    ? { params: toParams(safeParams), headers: migratedHeaders, body: { type: 'none' as const, content: '' } }
    : {
      params: [] as IRequestParam[],
      headers: migratedHeaders,
      body: {
        type: 'form-data' as const,
        content: toParams(safeParams),
      },
    };

  return { ...rest, verb, requestConfig };
};

const HttpVerbs: Method[] = ['get',
  'delete',
  'head',
  'options',
  'post',
  'put',
  'patch',
  'purge',
  'link',
  'unlink'];

const getApiCallArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addSettingsInputRow({
    id: 'httpverb-url-row',
    inputs: [
      {
        id: nanoid(),
        type: 'dropdown',
        propertyName: 'verb',
        label: 'HTTP Verb',
        dropdownOptions: HttpVerbs.map((v) => ({ id: v, label: v.toUpperCase(), value: v })),
      },
      {
        id: nanoid(),
        type: 'endpointsAutocomplete',
        propertyName: 'url',
        label: 'URL',
        description: 'Relative or absolute URL of the API endpoint. Relative ones will be send to the current back-end. Absolute URLs can be used for external applications.',
        httpVerb: "{data.verb}",
      },
    ],
  })
    .addSettingsInput({
      id: nanoid(),
      inputType: 'requestConfigButton',
      propertyName: 'requestConfig',
      label: 'Request Configuration',
      description: 'Configure request parameters, headers, and body',
    })
    .addSettingsInput({
      id: nanoid(),
      inputType: 'switch',
      propertyName: 'sendStandardHeaders',
      label: 'Send Standard Headers',
      description: 'Allow to send standard application headers including authentication. Note: it may be unsafe to send these headers to external applications.',
    })
    .toJson();
};

// Applies the optional response transformation. The original response is never mutated; when the
// transformation is disabled or fails, the original response is returned unchanged so a bad script
// can never break the action. `context` is the standard Shesha constants object (globalState,
// pageContext, http, form, data, …) with `response` layered in — the same scope every other code
// editor exposes.
const applyResponseTransformation = async (
  original: unknown,
  context: object,
  transformation?: IResponseTransformationConfiguration,
): Promise<unknown> => {
  if (!transformation?.enabled || !transformation.script.trim()) {
    return original;
  }

  const result = await executeResponseTransformation(transformation.script, context);
  if (result.success) {
    return result.output;
  }

  console.error('Response transformation failed, returning original response:', result.error);
  return original;
};

const isGlobalUrl = (url: string): boolean => {
  return !isNullOrWhiteSpace(url) && Boolean(url.match(/^(http|ftp|https):\/\//gi));
};

const hasHeader = (headers: Record<string, string>, name: string): boolean =>
  Object.keys(headers).some((k) => k.toLowerCase() === name.toLowerCase());

const setHeaderIfMissing = (headers: Record<string, string>, name: string, value: string): void => {
  if (!hasHeader(headers, name)) headers[name] = value;
};

const prepareUrlAndData = (url: string, verb: string, parameters: IDictionary<string>): { url: string; data: IDictionary<string> | undefined } => {
  const encodeAsQueryString = ['get', 'delete'].includes(verb.toLowerCase());
  if (encodeAsQueryString) {
    const queryStringData = { ...getQueryParams(url), ...parameters };
    return {
      url: `${url}?${qs.stringify(queryStringData, { allowDots: true })}`,
      data: undefined,
    };
  } else {
    return {
      url,
      data: parameters,
    };
  }
};

export const useApiCallAction = (): void => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  // The response transformation runs as a standard Shesha script, so it needs the same constants
  // (globalState, pageContext, http, form, data, …) as every other code editor. `responseHolder`
  // is a stable object whose `response` key is registered as an available constant; we write the
  // actual response into it just before executing the transformation. The accessor reads it lazily,
  // so the live value is picked up without rebuilding the constants on every API response.
  const responseHolder = useRef<{ response: unknown }>({ response: undefined });
  const allData = useAvailableConstantsData({}, responseHolder.current);

  useConfigurableAction<IApiCallArguments>({
    isPermament: true,
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'API Call',
    label: 'API Call',
    sortOrder: 5,
    hasArguments: true,
    argumentsFormMarkup: getApiCallArgumentsForm,
    migrator: (m) => m
      .add<IApiCallArgumentsV0>(0, (prev) => migrateV0toV1(prev)),
    // Evaluate arguments normally (params/headers/url get their Mustache resolved), but keep the
    // JSON/raw body template raw. A JSON body is one big string, and letting the generic pass run
    // Mustache over it can blank tags before the body data is available; instead the executer
    // evaluates it against the live execution context (same data params use). form-data field
    // values stay evaluated here and are read via resolveRequestValue.
    evaluateArguments: async (args, context) => {
      const evaluated = await genericActionArgumentsEvaluator<IApiCallArguments>(args, context);
      const srcBody = args.requestConfig?.body;
      const dstBody = evaluated?.requestConfig?.body;
      if (dstBody && srcBody && (srcBody.type === 'json' || srcBody.type === 'raw') && typeof srcBody.content === 'string') {
        dstBody.content = srcBody.content;
      }
      return evaluated;
    },
    executer: async (actionArgs, context) => {
      const {
        url,
        verb,
        sendStandardHeaders,
        requestConfig,
      } = actionArgs;

      // Backward compatibility: use legacy parameters/headers if requestConfig is not set
      let finalParams: Record<string, string> = {};
      let finalHeaders: Record<string, string> = {};
      let requestBody: unknown;

      if (requestConfig) {
        // New structure: use requestConfig
        const enabledParams = requestConfig.params?.filter((p) => p.enabled) || [];
        finalParams = enabledParams.reduce((acc, param) => {
          if (param.key) {
            let value = resolveRequestValue(param.value);

            // Special handling for 'properties' parameter - normalize GraphQL-like syntax
            // Convert multi-line format to single line with spaces
            if (param.key.toLowerCase() === 'properties' && typeof value === 'string') {
              value = value
                .split('\n') // Split by newlines
                .map((line) => line.trim()) // Trim each line
                .filter((line) => line) // Remove empty lines
                .join(' '); // Join with spaces
            }

            acc[param.key] = value;
          }
          return acc;
        }, {} as Record<string, string>);

        const enabledHeaders = requestConfig.headers?.filter((h) => h.enabled) || [];
        finalHeaders = enabledHeaders.reduce((acc, header) => {
          if (header.key) acc[header.key] = resolveRequestValue(header.value);
          return acc;
        }, {} as Record<string, string>);

        // Handle request body based on type
        if (requestConfig.body && requestConfig.body.type !== 'none') {
          switch (requestConfig.body.type) {
            case 'json':
              try {
                // Resolve Mustache in the JSON body against the live execution context (data,
                // globalState, etc.) before parsing, so e.g. {"name":"{{data.firstName}}"} works.
                const evaluatedJson = typeof requestConfig.body.content === 'string'
                  ? evaluateString(requestConfig.body.content, context as object)
                  : requestConfig.body.content;
                requestBody = typeof evaluatedJson === 'string'
                  ? JSON.parse(evaluatedJson) as unknown
                  : evaluatedJson;
              } catch {
                requestBody = requestConfig.body.content;
              }
              setHeaderIfMissing(finalHeaders, 'Content-Type', 'application/json');
              break;
            case 'form-data':
            case 'x-www-form-urlencoded':
              try {
                // New storage: typed array of fields. Legacy storage: JSON-stringified array.
                const rawContent = requestConfig.body.content;
                const toFormFields = (content: IRequestBody['content']): IFormDataField[] => {
                  if (Array.isArray(content)) return content as IFormDataField[];
                  if (typeof content === 'string') {
                    const parsed: unknown = JSON.parse(content);
                    return Array.isArray(parsed) ? (parsed as IFormDataField[]) : [];
                  }
                  return [];
                };
                const formFields = toFormFields(rawContent);
                requestBody = formFields.reduce((acc: Record<string, string>, field: IFormDataField) => {
                  if (field.key && field.enabled !== false) {
                    acc[field.key] = resolveRequestValue(field.value);
                  }
                  return acc;
                }, {});
                if (requestConfig.body.type === 'x-www-form-urlencoded') {
                  setHeaderIfMissing(finalHeaders, 'Content-Type', 'application/x-www-form-urlencoded');
                }
              } catch {
                requestBody = requestConfig.body.content;
              }
              break;
            case 'raw': {
              const rawSubType = requestConfig.body.rawSubType;
              if (rawSubType === 'javascript') {
                // Executable JS body: run the script against the live execution context (data,
                // globalState, http, …); its returned value becomes the payload.
                try {
                  requestBody = typeof requestConfig.body.content === 'string' && requestConfig.body.content.trim()
                    ? await executeScript<unknown>(requestConfig.body.content, context as object)
                    : undefined;
                } catch (e) {
                  console.error('API Call: JavaScript body execution failed:', e);
                  requestBody = undefined;
                }
                // Object results are sent as JSON; strings/primitives are sent as-is.
                if (requestBody !== null && typeof requestBody === 'object') {
                  setHeaderIfMissing(finalHeaders, 'Content-Type', 'application/json');
                }
              } else {
                // Other raw sub-types are sent as text, with Mustache resolved against the context.
                requestBody = typeof requestConfig.body.content === 'string'
                  ? evaluateString(requestConfig.body.content, context as object)
                  : requestConfig.body.content;
                const rawContentTypeMap: Record<string, string> = {
                  text: 'text/plain',
                  json: 'application/json',
                  xml: 'application/xml',
                  html: 'text/html',
                };
                setHeaderIfMissing(finalHeaders, 'Content-Type', rawContentTypeMap[rawSubType] ?? 'text/plain');
              }
              break;
            }
          }
        }
      }

      const standardHeaders = sendStandardHeaders ? httpHeaders : {};
      const allHeaders = { ...standardHeaders, ...finalHeaders };

      // validate arguments
      if (!url)
        return Promise.reject('Url is not specified.');
      if (!verb)
        return Promise.reject('Http verb is not specified.');

      const baseUrl = isGlobalUrl(url)
        ? undefined
        : backendUrl;

      // When an explicit body is configured on a non-GET verb, encode params as URL query string so
      // they are not silently dropped (without this, prepareUrlAndData would put them in the body).
      const hasParams = Object.keys(finalParams).length > 0;
      const bodyOverridesParams = requestBody !== undefined && hasParams;
      const effectiveUrl = bodyOverridesParams
        ? `${url.split('?')[0]}?${qs.stringify({ ...getQueryParams(url), ...finalParams }, { allowDots: true })}`
        : url;

      const { url: preparedUrl, data: paramsData } = prepareUrlAndData(
        effectiveUrl,
        verb,
        bodyOverridesParams ? {} : { ...finalParams },
      );
      const preparedData = requestBody !== undefined ? requestBody : paramsData;

      return axios({
        url: preparedUrl,
        data: preparedData,
        method: verb as Method,
        headers: allHeaders,
        ...(baseUrl && { baseURL: baseUrl }),
      }).then((response) => {
        const original: unknown = unwrapAbpResponse(response.data) as unknown;
        // Expose the freshly-received response to the transformation script as `response`.
        responseHolder.current.response = original;
        return applyResponseTransformation(original, allData, requestConfig?.responseTransformation);
      });
    },
  }, [backendUrl, httpHeaders, allData]);
};
