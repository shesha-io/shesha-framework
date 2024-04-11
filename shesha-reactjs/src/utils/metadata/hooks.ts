import { useMetadataFetcher } from "@/providers";
import { MetadataBuilder } from "./metadataBuilder";
import {
    SheshaConstants,
    registerContextsAction,
    registerFormAction,
    registerFormContextAction,
    registerFormModeAction,
    registerGlobalStateAction,
    registerHttpAction,
    registerMessageAction,
    registerMomentAction,
    registerSelectedRowAction,
    registerSetGlobalStateAction
} from "@/utils/metadata/standardProperties";
import { useFormDataRegistration } from "./useAvailableConstants";

export type MetadataBuilderFactory = (name: string, description?: string) => MetadataBuilder;

export const useMetadataBuilderFactory = (): MetadataBuilderFactory => {
    const metadataFetcher = useMetadataFetcher();
    const registerFormDataAction = useFormDataRegistration();

    return (name: string, description?: string) => {
        const builder = new MetadataBuilder(metadataFetcher, name, description);

        // register standard constants
        builder.registerStandardProperty(SheshaConstants.http, registerHttpAction);
        builder.registerStandardProperty(SheshaConstants.message, registerMessageAction);
        builder.registerStandardProperty(SheshaConstants.moment, registerMomentAction);
        builder.registerStandardProperty(SheshaConstants.globalState, registerGlobalStateAction);
        builder.registerStandardProperty(SheshaConstants.setGlobalState, registerSetGlobalStateAction);
        builder.registerStandardProperty(SheshaConstants.selectedRow, registerSelectedRowAction);
        builder.registerStandardProperty(SheshaConstants.contexts, registerContextsAction);
        builder.registerStandardProperty(SheshaConstants.formContext, registerFormContextAction);
        builder.registerStandardProperty(SheshaConstants.form, registerFormAction);
        builder.registerStandardProperty(SheshaConstants.formMode, registerFormModeAction);
        builder.registerStandardProperty(SheshaConstants.formData, registerFormDataAction);

        return builder;
    };
};