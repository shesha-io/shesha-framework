import { useMetadataFetcher } from "@/providers";
import { IMetadataBuilder, MetadataBuilder } from "../metadataBuilder";
import {
  SheshaConstants,
  registerFormAction,
  registerPageContextAction,
  registerGlobalStateAction,
  registerHttpAction,
  registerMessageAction,
  registerModalAction,
  registerMomentAction,
  registerSelectedRowAction,
  registerSetGlobalStateAction,
  registerQueryAction,
  registerMetadataBuilderAction,
  registerFileSaverAction,
} from "@/utils/metadata/standardProperties";
import { useFormDataRegistration } from "./useFormDataRegistration";
import { useAppContextRegistration } from "./useAppContextRegistration";
import { useContextsRegistration } from "./useContextsRegistration";
import { useComponentsRegistration } from "./useComponentsRegistration";

export type MetadataBuilderFactory = () => IMetadataBuilder;


export const useMetadataBuilderFactory = (): MetadataBuilderFactory => {
  const metadataFetcher = useMetadataFetcher();
  const registerFormDataAction = useFormDataRegistration();
  const registerApplicationAction = useAppContextRegistration();
  const registerContexts = useContextsRegistration();
  const registerComponentsAction = useComponentsRegistration();

  return () => {
    const builder = new MetadataBuilder(metadataFetcher);

    // register standard constants
    builder.registerStandardProperty(SheshaConstants.http, registerHttpAction);
    builder.registerStandardProperty(SheshaConstants.message, registerMessageAction);
    builder.registerStandardProperty(SheshaConstants.modal, registerModalAction);
    builder.registerStandardProperty(SheshaConstants.moment, registerMomentAction);
    builder.registerStandardProperty(SheshaConstants.fileSaver, registerFileSaverAction);
    builder.registerStandardProperty(SheshaConstants.globalState, registerGlobalStateAction);
    builder.registerStandardProperty(SheshaConstants.setGlobalState, registerSetGlobalStateAction);
    builder.registerStandardProperty(SheshaConstants.selectedRow, registerSelectedRowAction);
    builder.registerStandardProperty(SheshaConstants.contexts, registerContexts);
    builder.registerStandardProperty(SheshaConstants.pageContext, registerPageContextAction);
    builder.registerStandardProperty(SheshaConstants.form, registerFormAction);
    builder.registerStandardProperty(SheshaConstants.formData, registerFormDataAction);
    builder.registerStandardProperty(SheshaConstants.application, registerApplicationAction);
    builder.registerStandardProperty(SheshaConstants.query, registerQueryAction);

    builder.registerStandardProperty(SheshaConstants.components, registerComponentsAction);

    builder.registerStandardProperty(SheshaConstants.metadataBuilder, registerMetadataBuilderAction, false);
    // builder.registerStandardProperty(SheshaConstants.constantsBuilder, registerConstantsBuilderAction);

    return builder;
  };
};
