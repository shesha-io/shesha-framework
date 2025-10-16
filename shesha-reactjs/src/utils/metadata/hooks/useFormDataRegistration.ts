import { useCallback, useMemo } from "react";
import { DataTypes } from "@/interfaces";
import { useMetadata, useMetadataDispatcher } from "@/providers";
import { isEntityMetadata } from "@/interfaces/metadata";
import { useFormPersisterIfAvailable } from "@/providers/formPersisterProvider";
import { TypesImporter } from "../typesImporter";
import { MetadataBuilderAction } from "../metadataBuilder";

export const useFormDataRegistration = (): MetadataBuilderAction => {
  const meta = useMetadata(false);
  const { formProps } = useFormPersisterIfAvailable() ?? {};
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
            .then((meta) => {
              return isEntityMetadata(meta)
                ? typeDefinitionBuilder.getEntityType({ name: meta.entityType, module: meta.entityModule })
                : Promise.resolve(null);
            })
          : Promise.resolve(null);

        return baseTypeGetter.then((response) => {
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
