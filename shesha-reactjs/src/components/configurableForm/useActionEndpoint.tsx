import { DataTypes } from '@/interfaces/dataTypes';
import { evaluateComplexString, IMatchData, removeZeroWidthCharsFromString } from '@/providers/form/utils';
import { IApiEndpoint, isEntityMetadata, StandardEntityActions } from '@/interfaces/metadata';
import { IFormSettings } from '@/providers/form/models';
import { useMetadataDispatcher } from '@/providers';
import { useDeepCompareEffect } from 'react-use';
import { useState } from 'react';

export interface GetDefaultActionUrlPayload {
  actionName: string;
  modelType: string;
}
export interface GetFormActionUrlPayload {
  actionName: string;
  formSettings: IFormSettings;
  mappings: IMatchData[];
}

export interface IEntityEndpointsEvaluator {
  getDefaultActionUrl: (payload: GetDefaultActionUrlPayload) => Promise<IApiEndpoint>;
  getFormActionUrl: (payload: GetFormActionUrlPayload) => Promise<IApiEndpoint>;
}

export const useModelApiHelper = (): IEntityEndpointsEvaluator => {
  const { getMetadata } = useMetadataDispatcher();

  const getDefaultActionUrl = (payload: GetDefaultActionUrlPayload): Promise<IApiEndpoint> => {
    if (!payload.modelType)
      return Promise.reject('`modelType` is not provided');
    if (!payload.actionName)
      return Promise.reject('`name` is not provided');

    return getMetadata({ dataType: DataTypes.entityReference, modelType: payload.modelType }).then((m) => {
      const endpoint = isEntityMetadata(m)
        ? m.apiEndpoints[payload.actionName]
        : null;
      return endpoint;
    });
  };

  const getActionUrlFromFormSettings = (formSettings: IFormSettings, actionName: string): IApiEndpoint => {
    if (!formSettings)
      return null;

    let endpoint: IApiEndpoint;
    switch (actionName) {
      case StandardEntityActions.create:
        endpoint = { httpVerb: 'POST', url: formSettings.postUrl };
        break;
      case StandardEntityActions.read:
        endpoint = { httpVerb: 'GET', url: formSettings.getUrl };
        break;
      case StandardEntityActions.update:
        endpoint = { httpVerb: 'PUT', url: formSettings.putUrl };
        break;
      case StandardEntityActions.delete:
        endpoint = { httpVerb: 'DELETE', url: formSettings.deleteUrl };
        break;
    }

    if (!endpoint)
      return null;

    // cleanup the url
    endpoint.url = removeZeroWidthCharsFromString(endpoint.url ?? '');
    // don't return endpoint with empty url
    return endpoint.url
      ? endpoint
      : null;
  };

  const getFormActionUrl = (payload: GetFormActionUrlPayload): Promise<IApiEndpoint> => {
    const { formSettings, actionName, mappings } = payload;
    const customEndpoint = getActionUrlFromFormSettings(formSettings, actionName);

    if (customEndpoint) {
      const evaluatedrl = evaluateComplexString(customEndpoint.url, mappings);

      // evaluate value if required
      return Promise.resolve({ ...customEndpoint, url: evaluatedrl });
    } else
      // return defualt endpoint from metadata
      return formSettings?.modelType
        ? getDefaultActionUrl({ modelType: formSettings.modelType, actionName: actionName })
        : Promise.resolve(null);
  };

  return {
    getDefaultActionUrl,
    getFormActionUrl,
  };
};

export interface UseEntityEndpointArguments {
  actionName: string;
  formSettings: IFormSettings;
  mappings: IMatchData[];
}

export const useModelApiEndpoint = (args: UseEntityEndpointArguments): IApiEndpoint => {
  const [endpoint, setEndpoint] = useState<IApiEndpoint>(null);

  const { actionName, formSettings, mappings } = args;
  const endpointsHelper = useModelApiHelper();

  useDeepCompareEffect(() => {
    endpointsHelper.getFormActionUrl({ actionName, formSettings, mappings }).then((e) => {
      setEndpoint(e);
    });
  }, [args]);

  return endpoint;
};
