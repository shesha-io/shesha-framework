import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { StandardNodeTypes } from "@/interfaces/formComponent";
import { FormIdentifier } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";
import { INavigateActoinArguments as INavigateActionArguments } from "@/providers/shaRouting/index";
import { getQueryString, getUrlWithoutQueryParams } from "@/utils/url";

interface DynamicUrlParsingResponse {
  isDynamic: boolean;
  formId?: FormIdentifier;
  url?: string;
  queryParams?: IKeyValue[];
}
const parseDynamicUrl = (url: string): DynamicUrlParsingResponse => {
  const urlWithoutQuery = getUrlWithoutQueryParams(url);

  const urlParts = urlWithoutQuery.split('/').filter((e) => Boolean(e));
  const isDynamic = (urlParts.length === 2 || urlParts.length === 3) && urlParts[0].toLowerCase() === 'dynamic';
  const moduleName = isDynamic && urlParts.length === 3 ? urlParts[1] : undefined;
  const form = isDynamic
    ? urlParts.length === 3 ? urlParts[2] : urlParts[1]
    : undefined;

  const query = getQueryString(url);
  const queryParts = (query ? query.substring(1) : '').split('&').filter(Boolean);

  const queryParams = queryParts.map<IKeyValue>((part) => {
    const keyValue = part.split('=');
    const value = keyValue.length > 1 ? keyValue[1] : undefined;
    return { key: keyValue[0], value };
  });

  const result: DynamicUrlParsingResponse = {
    isDynamic: isDynamic,
    formId: form ? { name: form, module: moduleName } : undefined,
    url: urlWithoutQuery,
    queryParams: queryParams,
  };

  return result;
};

export const getNavigationActionArgumentsByUrl = (url: string): INavigateActionArguments => {
  if (!url)
    return undefined;

  const parsing = parseDynamicUrl(url);

  const newArgs: INavigateActionArguments = {
    navigationType: parsing.isDynamic ? "form" : "url",
    formId: parsing.isDynamic ? parsing.formId : undefined,
    url: !parsing.isDynamic ? parsing.url : undefined,
    queryParameters: parsing.queryParams,
  };

  return newArgs;
};

const migrateNavigateArgs = (args: INavigateActionArguments): INavigateActionArguments => {
  if (args && typeof (args['target']) === 'string') {
    return getNavigationActionArgumentsByUrl(args['target']);
  } else
    return { ...args, navigationType: "url" };
};

const updateActionRecursive = (prev: IConfigurableActionConfiguration, updater: (currentAction: IConfigurableActionConfiguration) => IConfigurableActionConfiguration): IConfigurableActionConfiguration => {
  if (!prev)
    return prev;

  const updated = updater({ ...prev, _type: StandardNodeTypes.ConfigurableActionConfig });

  return {
    ...updated,
    onFail: updated.onFail ? updateActionRecursive(updated.onFail, updater) : updated.onFail,
    onSuccess: updated.onSuccess ? updateActionRecursive(updated.onSuccess, updater) : updated.onSuccess,
  };
};

const migrateNavigateProps = (prev: IConfigurableActionConfiguration): IConfigurableActionConfiguration => {
  var args = prev?.actionArguments as INavigateActionArguments;

  const newArgs = migrateNavigateArgs(args);

  return { ...prev, actionArguments: newArgs, version: 2 };
};

export const migrateNavigateAction = (prev: IConfigurableActionConfiguration): IConfigurableActionConfiguration => {
  return updateActionRecursive(prev, (action) => {
    return (action.actionOwner === 'shesha.common' && action.actionName === 'Navigate')
      ? migrateNavigateProps(action)
      : action;
  });
};
