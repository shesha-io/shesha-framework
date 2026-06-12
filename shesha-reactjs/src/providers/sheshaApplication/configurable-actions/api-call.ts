import { nanoid } from '@/utils/uuid';
import { useSheshaApplication } from "@/providers";
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
import { IRequestParam, IRequestHeader, IRequestBody, RequestValue } from '@/components/requestConfigModal';
import { isPropertySettings } from '@/designer-components/_settings/utils';

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

const isGlobalUrl = (url: string): boolean => {
  return !isNullOrWhiteSpace(url) && Boolean(url.match(/^(http|ftp|https):\/\//gi));
};

export const useApiCallAction = (): void => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  useConfigurableAction<IApiCallArguments>({
    isPermament: true,
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'API Call',
    label: 'API Call',
    sortOrder: 5,
    hasArguments: true,
    argumentsFormMarkup: getApiCallArgumentsForm,
    executer: (actionArgs, _context) => {
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
                requestBody = typeof requestConfig.body.content === 'string'
                  ? JSON.parse(requestConfig.body.content)
                  : requestConfig.body.content;
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
                const formFields = JSON.parse(requestConfig.body.content as string);
                requestBody = formFields.reduce((acc: any, field: any) => {
                  if (field.key) acc[field.key] = field.value;
                  return acc;
                }, {});
                if (requestConfig.body.type === 'x-www-form-urlencoded' && !finalHeaders['Content-Type']) {
                  finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                }
              } catch {
                requestBody = requestConfig.body.content;
              }
              break;
            case 'raw':
              requestBody = requestConfig.body.content;
              break;
            case 'graphql':
              try {
                const graphqlBody = requestConfig.body.content as any;
                const payload: any = {
                  query: graphqlBody.query,
                };

                // Parse and add variables if provided
                if (graphqlBody.variables) {
                  try {
                    const parsedVariables = typeof graphqlBody.variables === 'string'
                      ? JSON.parse(graphqlBody.variables)
                      : graphqlBody.variables;
                    if (parsedVariables && Object.keys(parsedVariables).length > 0) {
                      payload.variables = parsedVariables;
                    }
                  } catch {
                    // If variables parsing fails, skip them
                  }
                }

                // Add operation name if provided
                if (graphqlBody.operationName) {
                  payload.operationName = graphqlBody.operationName;
                }

                requestBody = payload;

                // Set Content-Type for GraphQL
                if (!finalHeaders['Content-Type']) {
                  finalHeaders['Content-Type'] = 'application/json';
                }
              } catch {
                requestBody = requestConfig.body.content;
              }
              break;
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
      }).then((response) => unwrapAbpResponse(response.data));
    },
  }, [backendUrl, httpHeaders]);
};
