import { useRef } from 'react';
import { nanoid } from '@/utils/uuid';
import { useSheshaApplication } from "@/providers";
import { useAvailableConstantsData, evaluateString, genericActionArgumentsEvaluator } from '@/providers/form/utils';
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import axios, { Method } from 'axios';
import { IKeyValue } from "@/interfaces/keyValue";
import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import qs from "qs";
import { unwrapAbpResponse } from "@/utils/fetchers";
import { mapKeyValueToDictionary } from "@/utils/dictionary";
import { getQueryParams } from "@/utils/url";
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { FormMarkupFactory } from '@/interfaces/configurableAction';
import { IRequestParam, IRequestHeader, IRequestBody, IResponseTransformationConfiguration, RequestValue, executeResponseTransformation } from '@/components/requestConfigModal';
import { isPropertySettings } from '@/designer-components/_settings/utils/utils';

// The action arguments evaluator already runs Mustache on every string in the arguments tree,
// including `_value` and `_code` inside our IPropertySetting wrapper. So by the time the
// executer runs, those strings are already interpolated — we just need to pick the right one
// based on the chosen mode and unwrap the setting.
const resolveRequestValue = (raw: RequestValue): string | undefined => {
  if (isPropertySettings(raw)) {
    const wrapped = raw as { _mode?: string; _value?: unknown; _code?: unknown };
    const picked = wrapped._mode === 'code' ? wrapped._code : wrapped._value;
    return picked === undefined || picked === null ? '' : String(picked);
  }
  return raw as string | undefined;
};

export interface IApiCallArguments {
  url: string;
  verb: string;
  parameters: IKeyValue[];
  headers: IKeyValue[];
  sendStandardHeaders: boolean;
  // New structure for enhanced configuration
  requestConfig?: {
    params?: IRequestParam[];
    headers?: IRequestHeader[];
    body?: IRequestBody;
    responseTransformation?: IResponseTransformationConfiguration;
  };
}

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
  if (!transformation?.enabled || !transformation.script?.trim()) {
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
    // Evaluate arguments normally (params/headers/url get their Mustache resolved), but keep the
    // JSON/raw body template raw. A JSON body is one big string, and letting the generic pass run
    // Mustache over it can blank tags before the body data is available; instead the executer
    // evaluates it against the live execution context (same data params use). form-data field
    // values stay evaluated here and are read via resolveRequestValue.
    evaluateArguments: async (args, context) => {
      const evaluated = await genericActionArgumentsEvaluator<IApiCallArguments>(args, context);
      const srcBody = args?.requestConfig?.body;
      const dstBody = evaluated?.requestConfig?.body;
      if (dstBody && srcBody && (srcBody.type === 'json' || srcBody.type === 'raw') && typeof srcBody.content === 'string') {
        dstBody.content = srcBody.content;
      }
      return evaluated;
    },
    executer: (actionArgs, context) => {
      const {
        url,
        verb,
        sendStandardHeaders,
        requestConfig,
      } = actionArgs;

      // Backward compatibility: use legacy parameters/headers if requestConfig is not set
      let finalParams: Record<string, any> = {};
      let finalHeaders: Record<string, any> = {};
      let requestBody: any = undefined;

      // Debug logging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔍 API Call Debug:', {
          hasRequestConfig: !!requestConfig,
          requestConfigParams: requestConfig?.params,
          verb,
        });
      }

      if (requestConfig) {
        // New structure: use requestConfig
        const enabledParams = requestConfig.params?.filter((p) => p.enabled) || [];
        finalParams = enabledParams.reduce((acc, param) => {
          if (param.key) {
            let value: any = resolveRequestValue(param.value);

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
        }, {} as Record<string, any>);

        const enabledHeaders = requestConfig.headers?.filter((h) => h.enabled) || [];
        finalHeaders = enabledHeaders.reduce((acc, header) => {
          if (header.key) acc[header.key] = resolveRequestValue(header.value);
          return acc;
        }, {} as Record<string, any>);

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
                  ? JSON.parse(evaluatedJson)
                  : evaluatedJson;
              } catch {
                requestBody = requestConfig.body.content;
              }
              if (!finalHeaders['Content-Type']) {
                finalHeaders['Content-Type'] = 'application/json';
              }
              break;
            case 'form-data':
            case 'x-www-form-urlencoded':
              try {
                // New storage: typed array of fields. Legacy storage: JSON-stringified array.
                const rawContent = requestConfig.body.content;
                const formFields: Array<{ key: string; value: RequestValue; enabled?: boolean }> = Array.isArray(rawContent)
                  ? rawContent
                  : JSON.parse(rawContent as string);
                requestBody = formFields.reduce((acc: any, field) => {
                  if (field.key && field.enabled !== false) {
                    acc[field.key] = resolveRequestValue(field.value);
                  }
                  return acc;
                }, {});
                if (requestConfig.body.type === 'x-www-form-urlencoded' && !finalHeaders['Content-Type']) {
                  finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                }
              } catch {
                requestBody = requestConfig.body.content;
              }
              break;
            case 'raw': {
              // Resolve Mustache in the raw body against the live execution context.
              requestBody = typeof requestConfig.body.content === 'string'
                ? evaluateString(requestConfig.body.content, context as object)
                : requestConfig.body.content;
              const rawSubType = requestConfig.body.rawSubType ?? 'text';
              const rawContentTypeMap: Record<string, string> = {
                text: 'text/plain',
                json: 'application/json',
                xml: 'application/xml',
                html: 'text/html',
                javascript: 'application/javascript',
              };
              if (!finalHeaders['Content-Type']) {
                finalHeaders['Content-Type'] = rawContentTypeMap[rawSubType] ?? 'text/plain';
              }
              break;
            }
          }
        }
      } else {
        // Legacy structure: use old parameters/headers
        finalParams = mapKeyValueToDictionary(actionArgs.parameters) || {};
        finalHeaders = mapKeyValueToDictionary(actionArgs.headers) || {};
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

      let preparedUrl = url;
      let preparedData = requestBody !== undefined ? requestBody : { ...finalParams };
      const encodeAsQueryString = ['get', 'delete'].includes(verb?.toLowerCase());

      if (encodeAsQueryString) {
        const queryStringData = { ...getQueryParams(preparedUrl), ...finalParams };
        const queryString = qs.stringify(queryStringData, { allowDots: true });

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔍 Query String Debug:', {
            finalParams,
            queryStringData,
            queryString,
            originalUrl: preparedUrl,
          });
        }

        // Remove trailing ? from URL if present
        const cleanUrl = preparedUrl.endsWith('?') ? preparedUrl.slice(0, -1) : preparedUrl;

        // Add query string only if there are parameters
        if (queryString) {
          preparedUrl = `${cleanUrl}?${queryString}`;
        } else {
          preparedUrl = cleanUrl;
        }

        preparedData = undefined;
      } else if (requestBody === undefined) {
        // If no body was explicitly set, use params as body for POST/PUT/PATCH
        preparedData = { ...finalParams };
      }

      return axios({
        url: preparedUrl,
        data: preparedData,
        method: verb as Method,
        headers: allHeaders,
        ...(baseUrl && { baseURL: baseUrl }),
      }).then((response) => {
        const original = unwrapAbpResponse(response.data);
        // Expose the freshly-received response to the transformation script as `response`.
        responseHolder.current.response = original;
        return applyResponseTransformation(original, allData, requestConfig?.responseTransformation);
      });
    },
  }, [backendUrl, httpHeaders, allData]);
};
