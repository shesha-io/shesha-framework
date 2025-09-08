import { FormLoadingItem, UpToDateForm } from "./interfaces";
import { FormIdentifier, FormRawMarkup, IFormSettings } from "../form/models";
import { ConfigurationItemsViewMode } from "../appConfigurator/models";
import { createNamedContext } from "@/utils/react";

export interface IFormManagerStateContext {

}

export type GetFormByMarkupPayload = {
    key: string;
    markup: FormRawMarkup;
    formSettings: IFormSettings;
    isSettingsForm?: boolean;
};

export type GetFormByIdPayload = {
    formId: FormIdentifier;
    configurationItemMode?: ConfigurationItemsViewMode;
    skipCache: boolean;
};

export interface IFormManagerActionsContext {
    getFormById: (payload: GetFormByIdPayload) => Promise<UpToDateForm>;
    getFormByIdLoader: (payload: GetFormByIdPayload) => FormLoadingItem;

    getFormByMarkup: (payload: GetFormByMarkupPayload) => Promise<UpToDateForm>;
    getFormByMarkupLoader: (payload: GetFormByMarkupPayload) => FormLoadingItem;
}

export const FormManagerStateContext = createNamedContext<IFormManagerStateContext>(undefined, "FormManagerStateContext");

export const FormManagerActionsContext = createNamedContext<IFormManagerActionsContext>(undefined, "FormManagerActionsContext");
