import { useMetadataFetcher } from "@/providers";
import { IMetadataBuilder, MetadataBuilder } from "./metadataBuilder";
import {
    SheshaConstants,
    registerContextsAction,
    registerFormAction,
    registerPageContextAction,
    registerGlobalStateAction,
    registerHttpAction,
    registerMessageAction,
    registerMomentAction,
    registerSelectedRowAction,
    registerSetGlobalStateAction,
    registerQueryAction,
    registerMetadataBuilderAction,
    //registerConstantsBuilderAction
} from "@/utils/metadata/standardProperties";
import { useAppContextRegistration, useFormDataRegistration } from "./useAvailableConstants";

export type MetadataBuilderFactory = () => IMetadataBuilder;

export const useMetadataBuilderFactory = (): MetadataBuilderFactory => {
    const metadataFetcher = useMetadataFetcher();
    const registerFormDataAction = useFormDataRegistration();
    const registerApplicationAction = useAppContextRegistration();    

    return () => {
        const builder = new MetadataBuilder(metadataFetcher);

        // register standard constants
        builder.registerStandardProperty(SheshaConstants.http, registerHttpAction);
        builder.registerStandardProperty(SheshaConstants.message, registerMessageAction);
        builder.registerStandardProperty(SheshaConstants.moment, registerMomentAction);
        builder.registerStandardProperty(SheshaConstants.globalState, registerGlobalStateAction);
        builder.registerStandardProperty(SheshaConstants.setGlobalState, registerSetGlobalStateAction);
        builder.registerStandardProperty(SheshaConstants.selectedRow, registerSelectedRowAction);
        builder.registerStandardProperty(SheshaConstants.contexts, registerContextsAction);
        builder.registerStandardProperty(SheshaConstants.pageContext, registerPageContextAction);
        builder.registerStandardProperty(SheshaConstants.form, registerFormAction);
        builder.registerStandardProperty(SheshaConstants.formData, registerFormDataAction);
        builder.registerStandardProperty(SheshaConstants.application, registerApplicationAction);
        builder.registerStandardProperty(SheshaConstants.query, registerQueryAction);
        
        builder.registerStandardProperty(SheshaConstants.metadataBuilder, registerMetadataBuilderAction, false);
        //builder.registerStandardProperty(SheshaConstants.constantsBuilder, registerConstantsBuilderAction);

        return builder;
    };
};