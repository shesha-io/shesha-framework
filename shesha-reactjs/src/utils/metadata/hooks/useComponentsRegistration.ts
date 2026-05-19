import { useCallback } from "react";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";
import { useComponentApi } from "@/providers/componentApi/provider";
import { isDefined } from "@/utils/nullables";
import { isPropertiesArray, TypeDefinition } from "@/interfaces";

// Not used in current implementation
// Use this method if you need to add separate Components variable to the code editor
export const useComponentsRegistration = (): MetadataBuilderAction => {
  const componentApi = useComponentApi();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    const components = componentApi?.getComponents();
    if (componentApi && components?.length) {
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
            builder.addCustom(componentName, component.componentModel?.description || `${component.componentModel?.type || component.componentName}Api`, () => {
              return Promise.resolve(component.typeDefinition as TypeDefinition);
            }, true);
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
