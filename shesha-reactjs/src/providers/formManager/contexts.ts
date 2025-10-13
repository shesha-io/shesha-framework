import { FormLoadingItem, UpToDateForm } from "./interfaces";
import { FormIdentifier, FormRawMarkup, IFormSettings } from "../form/models";
import { createNamedContext } from "@/utils/react";

export type GetFormByMarkupPayload = {
  key: string;
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  isSettingsForm?: boolean;
};

export type GetFormByIdPayload = {
  formId: FormIdentifier;
  skipCache: boolean;
};

export interface IFormManagerActionsContext {
  getFormById: (payload: GetFormByIdPayload) => Promise<UpToDateForm>;
  getFormByIdLoader: (payload: GetFormByIdPayload) => FormLoadingItem;

  getFormByMarkup: (payload: GetFormByMarkupPayload) => Promise<UpToDateForm>;
  getFormByMarkupLoader: (payload: GetFormByMarkupPayload) => FormLoadingItem;
}

export const FormManagerActionsContext = createNamedContext<IFormManagerActionsContext | undefined>(undefined, "FormManagerActionsContext");
