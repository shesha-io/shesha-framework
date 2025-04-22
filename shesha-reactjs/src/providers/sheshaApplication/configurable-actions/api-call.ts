import { nanoid } from '@/utils/uuid';
import { useSheshaApplication } from "@/providers";
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import axios, { Method } from 'axios';
import { IKeyValue } from "@/interfaces/keyValue";
import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import qs from "qs";
import { unwrapAbpResponse } from "@/utils/fetchers";
import { mapKeyValueToDictionary } from "@/utils/dictionary";
import { getQueryParams } from "@/utils/url";

export interface IApiCallArguments {
  url: string;
  verb: string;
  parameters: IKeyValue[];
  headers: IKeyValue[];
  sendStandardHeaders: boolean;
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

export const apiCallArgumentsForm = new DesignerToolbarSettings()
  .addSettingsInputRow({
    id: 'httpverb-url-row',
    inputs: [
      {
        id: nanoid(),
        type: 'dropdown',
        propertyName: 'verb',
        label: 'HTTP Verb',
        dropdownOptions: HttpVerbs.map(v => ({ id: v, label: v.toUpperCase(), value: v })),
        defaultValue: 'get',
      },
      {
        id: nanoid(),
        type: 'endpointsAutocomplete',
        propertyName: 'url',
        label: 'URL',
        description: 'Relative or absolute URL of the API endpoint. Relative ones will be send to the current back-end. Absolute URLs can be used for external applications.',
        httpVerb: "{data.verb}",
      }
    ]
  })
  .addSettingsInputRow({
    id: "parameters-standard-header-row",
    inputs: [
      {
        id: nanoid(),
        type: 'labelValueEditor',
        propertyName: 'parameters',
        label: 'Parameters',
        description: 'Request parameters. They will be included into the request as query string or body depending on the selected verb.',
        labelName: 'key',
        labelTitle: 'Key',
        valueName: 'value',
        valueTitle: 'Value',
      },
      {
        id: nanoid(),
        type: 'switch',
        propertyName: 'sendStandardHeaders',
        label: 'Send Standard Headers',
        description: 'Allow to send standard application headers including authentication. Note: it may be unsafe to send these headers to external applications.',
        defaultValue: true,
      }
    ]
  })
  .addSettingsInput({
    id: nanoid(),
    inputType: 'labelValueEditor',
    propertyName: 'headers',
    label: 'Headers',
    labelName: 'key',
    labelTitle: 'Key',
    valueName: 'value',
    valueTitle: 'Value',
  })
  .toJson();

const isGlobalUrl = (url: string) => {
  return url?.match(/^(http|ftp|https):\/\//gi);
};

export const useApiCallAction = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  useConfigurableAction<IApiCallArguments>({
    isPermament: true,
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'API Call',
    hasArguments: true,
    argumentsFormMarkup: apiCallArgumentsForm,
    executer: (actionArgs, _context) => {
      const {
        url,
        verb,
        sendStandardHeaders,
      } = actionArgs;

      const headers = mapKeyValueToDictionary(actionArgs.headers) ?? {};
      const standardHeaders = sendStandardHeaders
        ? httpHeaders
        : {};
      const allHeaders = { ...standardHeaders, ...headers };

      const parameters = mapKeyValueToDictionary(actionArgs.parameters);

      // validate arguments
      if (!url)
        return Promise.reject('Expected expression to be defined but it was found to be empty.');

      const baseUrl = isGlobalUrl(url)
        ? undefined
        : backendUrl;

      let preparedUrl = url;
      let preparedData = { ...parameters };
      const encodeAsQueryString = ['get', 'delete'].includes(verb?.toLowerCase());
      if (encodeAsQueryString) {
        const queryStringData = { ...getQueryParams(preparedUrl), ...preparedData };
        preparedUrl = `${preparedUrl}?${qs.stringify(queryStringData)}`;
        preparedData = undefined;
      }

      return axios({
        url: preparedUrl,
        baseURL: baseUrl,
        data: preparedData,
        method: verb as Method,
        headers: allHeaders,
      }).then(response => unwrapAbpResponse(response.data));
    }
  }, [backendUrl, httpHeaders]);
};  