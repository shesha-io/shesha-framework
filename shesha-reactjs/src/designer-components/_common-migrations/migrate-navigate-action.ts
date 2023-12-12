import { FormIdentifier, getUrlWithoutQueryParams } from "@/index";
import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { StandardNodeTypes } from "@/interfaces/formComponent";
import { IKeyValue } from "@/interfaces/keyValue";
import { INavigateActoinArguments } from "@/providers/shaRouting/index";
import { getQueryString } from "@/utils/url";

export const migrateNavigateAction = (prev: IConfigurableActionConfiguration): IConfigurableActionConfiguration => {
    return updateActionRecursive(prev, action => {
        return (prev.actionOwner === 'shesha.common' && prev.actionName === 'Navigate')
            ? migrateNavigateProps(action)
            : action;
    });
};

const migrateNavigateProps = (prev: IConfigurableActionConfiguration): IConfigurableActionConfiguration => {
    var args = prev?.actionArguments as INavigateActoinArguments;

    const newArgs = migrateNavigateArgs(args);

    return { ...prev, actionArguments: newArgs, version: 2 };
};

const migrateNavigateArgs = (args: INavigateActoinArguments): INavigateActoinArguments => {
    if (args && typeof(args['target']) === 'string'){
        const parsing = parseDynamicUrl(args['target']);

        const newArgs: INavigateActoinArguments = {
            navigationType: parsing.isDynamic ? "form" : "url",
            formId: parsing.isDynamic ? parsing.formId : undefined,
            url: !parsing.isDynamic ? parsing.url : undefined,
            queryParameters: parsing.queryParams
        };

        return newArgs;
    } else
        return {...args, navigationType: "url" };
};

interface DynamicUrlParsingResponse {
    isDynamic: boolean;
    formId?: FormIdentifier;
    url?: string;
    queryParams?: IKeyValue[];
}
const parseDynamicUrl = (url: string): DynamicUrlParsingResponse => {
    const urlWithoutQuery = getUrlWithoutQueryParams(url);

    const urlParts = urlWithoutQuery.split('/').filter(e => Boolean(e));
    const isDynamic = (urlParts.length === 2 || urlParts.length === 3) && urlParts[0].toLowerCase() === 'dynamic';
    const module = isDynamic && urlParts.length === 3 ? urlParts[1] : undefined;
    const form = isDynamic 
        ? urlParts.length === 3 ? urlParts[2] : urlParts[1]
        : undefined;

    const query = getQueryString(url);
    const queryParts = (query ? query.substring(1) : '').split('&');
    const queryParams = queryParts.map<IKeyValue>(part => {
        const keyValue = part.split('=');
        const value = keyValue.length > 1 ? keyValue[1] : undefined;
        return { key: keyValue[0], value };
    });
    
    const result: DynamicUrlParsingResponse = {
        isDynamic: isDynamic,
        formId: form ? { name: form, module } : undefined,
        url: urlWithoutQuery,
        queryParams: queryParams,
    };
    
    return result;
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