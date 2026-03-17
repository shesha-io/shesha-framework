import { useCallback } from "react";
import { useMetadataFetcher } from "@/providers";
import { IMetadataBuilder, MetadataBuilder } from "../metadataBuilder";
import {
  SheshaConstants,
  registerQueryAction,
  registerMetadataBuilderAction,
  registerPageAction,
  registerWebStorageAction,
  registerConstantsBuilderAction,
} from "@/utils/metadata/standardProperties";
import { useFormDataRegistration } from "./useFormDataRegistration";
import { useAppContextRegistration } from "./useAppContextRegistration";
import { useFormRegistration } from "./useFormRegistration";
import { getUtilsPublicApiRegistration } from "@/publicJsApis/metadata/utils";
import { getActionsPublicApiRegistration } from "@/publicJsApis/metadata/actions";
import { getUserPublicApiRegistration } from "@/publicJsApis/metadata/user";

export type MetadataBuilderFactory = () => IMetadataBuilder;

export const useMetadataBuilderFactory = (makeComponentsNullable: boolean = false): MetadataBuilderFactory => {
  const metadataFetcher = useMetadataFetcher();
  const registerFormDataAction = useFormDataRegistration();
  const registerApplicationAction = useAppContextRegistration();
  // const registerContexts = useContextsRegistration();
  const registerFormAction = useFormRegistration(makeComponentsNullable);

  return useCallback(() => {
    const builder = new MetadataBuilder(metadataFetcher);

    // register standard constants
    builder.registerStandardProperty(SheshaConstants.form, registerFormAction);
    builder.registerStandardProperty(SheshaConstants.user, getUserPublicApiRegistration);
    builder.registerStandardProperty(SheshaConstants.actions, getActionsPublicApiRegistration);
    builder.registerStandardProperty(SheshaConstants.utils, getUtilsPublicApiRegistration);

    builder.registerStandardProperty(SheshaConstants.page, registerPageAction);

    builder.registerStandardProperty(SheshaConstants.formData, registerFormDataAction);
    builder.registerStandardProperty(SheshaConstants.application, registerApplicationAction);
    builder.registerStandardProperty(SheshaConstants.query, registerQueryAction);
    builder.registerStandardProperty(SheshaConstants.webStorage, registerWebStorageAction);

    builder.registerStandardProperty(SheshaConstants.metadataBuilder, registerMetadataBuilderAction, false);
    builder.registerStandardProperty(SheshaConstants.constantsBuilder, registerConstantsBuilderAction);

    // builder.registerStandardProperty(SheshaConstants.http, registerHttpAction);
    // builder.registerStandardProperty(SheshaConstants.message, registerMessageAction);
    // builder.registerStandardProperty(SheshaConstants.modal, registerModalAction);
    // builder.registerStandardProperty(SheshaConstants.moment, registerMomentAction);
    // builder.registerStandardProperty(SheshaConstants.fileSaver, registerFileSaverAction);
    // builder.registerStandardProperty(SheshaConstants.globalState, registerGlobalStateAction);
    // builder.registerStandardProperty(SheshaConstants.setGlobalState, registerSetGlobalStateAction);
    // builder.registerStandardProperty(SheshaConstants.selectedRow, registerSelectedRowAction);
    // builder.registerStandardProperty(SheshaConstants.contexts, registerContexts);
    // builder.registerStandardProperty(SheshaConstants.pageContext, registerPageContextAction);

    return builder;
  }, [metadataFetcher, registerFormAction, registerFormDataAction, registerApplicationAction]);
};
