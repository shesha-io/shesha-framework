import { useCallback, useMemo, useState } from "react";
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { useMetadata, useMetadataDispatcher } from "@/providers";
import { IPropertyMetadata, isEntityMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { useFormPersister } from "@/providers/formPersisterProvider";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManagerActions } from "@/providers/dataContextManager";
import { useMetadataBuilderFactory } from "./hooks";
import { SheshaConstants } from "@/utils/metadata/standardProperties";
import { TypesImporter } from "./typesImporter";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "./metadataBuilder";
import { StandardConstantInclusionArgs } from "@/publicJsApis/metadataBuilder";

export interface AvailableConstantsArgs {
    addGlobalConstants?: boolean;
    standardConstants?: StandardConstantInclusionArgs[];
    onBuild?: (metaBuilder: IObjectMetadataBuilder) => void;
}

export const useGlobalConstants = (): IPropertyMetadata[] => {
    const { getDataContext } = useDataContextManagerActions();

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

export const useContextsRegistration = (): MetadataBuilderAction => {
  const { getDataContexts } = useDataContextManagerActions();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
      const contexts = getDataContexts();
      if (contexts.length) {
          builder.addObject('contexts', "Contexts", builder => {
              for (const context of contexts)
                  if (context.metadata && (context.metadata.properties?.length || context.metadata.methods?.length || context.metadata.typeDefinitionLoader)) {
                      builder.addObject(context.name, context.description, builder => {
                          if (context.metadata.typeDefinitionLoader)
                              builder.setTypeDefinition(context.metadata.typeDefinitionLoader);
                          if (isPropertiesArray(context.metadata.properties))
                              builder.setProperties(context.metadata.properties);
                          if (context.metadata.methods && Array.isArray(context.metadata.methods))
                              builder.setMethods(context.metadata.methods);
                          return builder;
                      });
                  } else {
                      builder.addObject(context.name, context.description, builder => {
                          builder.addAny('[key: string]', 'fields');
                      });
                  }
              return builder;
          });
      }
  }, []);

  return action;
};

export const useAppContextRegistration = (): MetadataBuilderAction => {
    const { getDataContext } = useDataContextManagerActions();

    const action = useCallback((builder: IObjectMetadataBuilder) => {
        const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
        if (appContext?.metadata) {
            builder.addObject(SheshaCommonContexts.ApplicationContext, "", builder => {
                if (isPropertiesArray(appContext.metadata.properties))
                    builder.setProperties(appContext.metadata.properties);
                return builder;
            });
        }
    }, []);

    return action;
};

const ALL_STANDARD_CONSTANTS = [
    SheshaConstants.globalState,
    SheshaConstants.setGlobalState,
    SheshaConstants.selectedRow,
    SheshaConstants.contexts,
    SheshaConstants.pageContext,
    SheshaConstants.http,
    SheshaConstants.message,
    SheshaConstants.moment,
    SheshaConstants.fileSaver,
    SheshaConstants.form,
    SheshaConstants.formData,
];

export const useAvailableConstantsMetadata = ({ addGlobalConstants, onBuild, standardConstants = ALL_STANDARD_CONSTANTS }: AvailableConstantsArgs): IObjectMetadata => {
    const globalProps = useGlobalConstants();

    const metadataBuilderFactory = useMetadataBuilderFactory();

    const response = useMemo<IObjectMetadata>(() => {
        const metaBuilder = metadataBuilderFactory();

        const objectBuilder = metaBuilder.object("constants") as IObjectMetadataBuilder;

        objectBuilder.addStandard(standardConstants);

        onBuild?.(objectBuilder);

        const meta = objectBuilder.build();

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