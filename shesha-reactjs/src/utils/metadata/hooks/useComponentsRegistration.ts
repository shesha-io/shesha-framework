import { useCallback } from "react";
import { isPropertiesArray, TypeDefinition } from "@/interfaces/metadata";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";
import { isDefined } from "@/utils/nullables";
import { useComponentApi } from "@/providers/componentApi/provider";

export const useComponentsRegistration = (): MetadataBuilderAction => {
  const componentApi = useComponentApi();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    const components = componentApi?.getComponents();
    if (components?.length) {
      builder.addObject('components', "Components API", (builder) => {
        for (const component of components) {
          const componentName = component.componentName;
          if (!componentName) continue;
          const meta = component.metadata;
          if (isDefined(meta) && (meta.properties?.length || meta.methods?.length || meta.typeDefinitionLoader)) {
            builder.addObject(componentName, component.componentModel?.description, (builder) => {
              if (meta.typeDefinitionLoader)
                builder.setTypeDefinition(meta.typeDefinitionLoader);
              if (isPropertiesArray(meta.properties))
                builder.setProperties(meta.properties);
              if (meta.methods && Array.isArray(meta.methods))
                builder.setMethods(meta.methods);
              return builder;
            });
          } else if (component.typeDefinition) {
            builder.addCustom(componentName, component.componentModel?.description || `${component.componentModel?.type ?? component.componentName}Api`, () => {
              return Promise.resolve(component.typeDefinition as TypeDefinition);
            });
          } else {
            builder.addObject(componentName, component.componentModel?.description, (builder) => {
              return builder.addAny('[key: string]', 'fields');
            });
          }
        }
        return builder;
      });
    }
  }, [componentApi]);

  return action;
};
