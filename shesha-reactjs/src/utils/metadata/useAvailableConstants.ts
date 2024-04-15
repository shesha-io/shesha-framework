import { useCallback, useMemo, useState } from "react";
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { useMetadata, useMetadataDispatcher } from "@/providers";
import { IPropertyMetadata, isEntityMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { useFormPersister } from "@/providers/formPersisterProvider";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManager } from "@/providers/dataContextManager";
import { useMetadataBuilderFactory } from "./hooks";
import { SheshaConstants } from "@/utils/metadata/standardProperties";
import { TypesImporter } from "./typesImporter";
import { MetadataBuilder, MetadataBuilderAction } from "./metadataBuilder";

export interface StandardConstantWithCustomName {
    uid: string;
    name: string;
}
export type StandardConstantInclusionArgs = string | StandardConstantWithCustomName;

export interface AvailableConstantsArgs {
    addGlobalConstants?: boolean;
    standardConstants?: StandardConstantInclusionArgs[];
    onBuild?: (metaBuilder: MetadataBuilder) => void;
}

export const useGlobalConstants = (): IPropertyMetadata[] => {
    const { getDataContext } = useDataContextManager();

    const [constants] = useState<IPropertyMetadata[]>(() => {
        const result: IPropertyMetadata[] = [];
        const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
        if (appContext?.metadata)
            result.push({ ...appContext.metadata, path: SheshaCommonContexts.ApplicationContext });

        return result;
    });

    return constants;
};

export const useFormDataRegistration = (): MetadataBuilderAction => {
    const meta = useMetadata(false);
    const { formProps } = useFormPersister(false) ?? {};
    const { getMetadata } = useMetadataDispatcher();

    const formMetadata = meta?.metadata;
    const formId = useMemo(() => {
        return formProps ? { name: formProps.name, module: formProps.module } : undefined;
    }, [formProps]);    
    
    const action = useCallback((metaBuilder, name = "data") => {
        if (formId) {
            // add form model definition
            metaBuilder.addCustom(name, "Form values", ({ typeDefinitionBuilder }) => {
                const baseTypeGetter = formMetadata && isEntityMetadata(formMetadata)
                    ? getMetadata({ dataType: DataTypes.entityReference, modelType: formMetadata.entityType })
                        .then(meta => {
                            return isEntityMetadata(meta)
                                ? typeDefinitionBuilder.getEntityType({ name: meta.entityType, module: meta.entityModule })
                                : Promise.resolve(null);
                        })
                    : Promise.resolve(null);

                return baseTypeGetter.then(response => {
                    const commentBlock = `/**
  * Model of the ${formId.module}/${formId.name} form
  */`;
                    const modelDefinition = response
                        ? `import { ${response.typeName} } from '${TypesImporter.cleanupFileNameForImport(response.filePath)}';
  
  ${commentBlock}
  export interface FormModel extends ${response.typeName} {
    [key: string]: any;
  }`
                        : `${commentBlock}
  export interface FormModel {
    [key: string]: any;
  }`;
                    return typeDefinitionBuilder.makeFormType(formId, modelDefinition);
                });
            });
        };
    }, [formId, formMetadata]);

    return action;
};

const ALL_STANDARD_CONSTANTS = [
    SheshaConstants.globalState,
    SheshaConstants.setGlobalState,
    SheshaConstants.selectedRow,
    SheshaConstants.contexts,
    SheshaConstants.formContext,
    SheshaConstants.http,
    SheshaConstants.message,
    SheshaConstants.moment,
    SheshaConstants.form,
    SheshaConstants.formMode,
    SheshaConstants.formData,
];

export const useAvailableConstantsMetadata = ({ addGlobalConstants, onBuild, standardConstants = ALL_STANDARD_CONSTANTS }: AvailableConstantsArgs): IObjectMetadata => {
    const globalProps = useGlobalConstants();

    const metadataBuilderFactory = useMetadataBuilderFactory();

    const response = useMemo<IObjectMetadata>(() => {
        const metaBuilder = metadataBuilderFactory("constants");

        metaBuilder.addStandard(standardConstants);
            
        onBuild?.(metaBuilder);

        const meta = metaBuilder.build();

        if (addGlobalConstants && globalProps && isPropertiesArray(meta.properties)) {
            meta.properties.push(...globalProps);
        }

        return meta;
    }, [addGlobalConstants, globalProps]);

    return response;
};

export const useAvailableStandardConstantsMetadata = (): IObjectMetadata => {
    const availableConstants = useAvailableConstantsMetadata({
        addGlobalConstants: true,
    });
    return availableConstants;
};

