import { nanoid } from "nanoid";
import { useSheshaApplication } from "../../..";
import { DesignerToolbarSettings } from "../../../interfaces/toolbarSettings";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import axios, { Method } from 'axios';
import { IKeyValue } from "../../../interfaces/keyValue";
import { useConfigurableAction } from "../../configurableActionsDispatcher";
import qs from "qs";
import { getQueryString } from "../../../components/autocomplete/utils";

export interface IApiCallArguments {
  url: string;
  verb: string;
  parameters: IKeyValue[],
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
  .addDropdown({
    id: nanoid(),
    name: 'verb',
    label: 'Http Verb',
    useRawValues: true,
    dataSourceType: 'values',
    values: HttpVerbs.map(v => ({ id: v, label: v, value: v })),
    defaultValue: 'post',
  })
  .addEndpointsAutocomplete({
    id: nanoid(),
    name: 'url',
    label: 'URL',
    description: 'Relative or absolute URL of the API endpoint. Relative ones will be send to the current back-end. Absolute URLs can be used for external applications.',
    httpVerb: "{data.verb}",    
  })
  .addLabelValueEditor({
    id: nanoid(),
    name: 'parameters',
    label: 'Parameters',
    description: 'Request parameters. They will be included into the request as query string or body depending on the selected verb.',
    labelName: 'key',
    labelTitle: 'Key',
    valueName: 'value',
    valueTitle: 'Value',
  })
  .addCheckbox({
    id: nanoid(),
    name: 'sendStandardHeaders',
    label: 'Send standard headers',
    description: 'Allow to send standard application headers including authentication. Note: it may be unsafe to send these headers to external applications.',
    defaultValue: true,
  })
  .addLabelValueEditor({
    id: nanoid(),
    name: 'headers',
    label: 'Headers',
    labelName: 'key',
    labelTitle: 'Key',
    valueName: 'value',
    valueTitle: 'Value',
  })
  .toJson();

type StringDictionary = {
  [key: string]: string;
}
const mapKeyValueToDictionary = (value: IKeyValue[]): StringDictionary => {
  if (!value)
    return undefined;

  const result = {};
  value.forEach(item => {
    if (item.key)
      result[item.key] = item.value;
  });
  return result;
}

const isGlobalUrl = (url: string) => {
  return url?.match(/^(http|ftp|https):\/\//gi);
}

export const useApiCallAction = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  useConfigurableAction<IApiCallArguments>({
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
      let preparedData = {...parameters};
      const encodeAsQueryString = ['get', 'delete'].includes(verb?.toLowerCase());
      if (encodeAsQueryString){
        const queryStringData = { ...getQueryString(preparedUrl), ...preparedData };
        preparedUrl = `${preparedUrl}?${qs.stringify(queryStringData)}`;
        preparedData = undefined;
      }     

      return axios({
        url: preparedUrl,
        baseURL: baseUrl,
        data: preparedData,
        method: verb as Method,
        headers: allHeaders,
      });
    }
  }, [backendUrl, httpHeaders]);
}  