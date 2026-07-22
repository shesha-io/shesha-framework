import { useCallback } from "react";
import { TypeDefinition } from "@/interfaces/metadata";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";
import { useComponentApi } from "@/providers/componentApi/provider";
import { componentsToTypeDefinition } from "@/providers/componentApi/metadata";
import { formCode } from "@/publicJsApis/apis";

export const useFormRegistration = (makeComponentsNullable: boolean): MetadataBuilderAction => {
  const componentApi = useComponentApi();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    builder.addCustom("form", "Form instance API", async (ctx) => {
      const components = componentApi?.getComponents();
      if (componentApi && components?.length) {
        await componentsToTypeDefinition(components, ctx, makeComponentsNullable);
      }
      const definition: TypeDefinition = {
        typeName: 'FormApi',
        files: [{ content: formCode, fileName: 'apis/form.ts' }],
      };
      return definition;
    });
  }, [componentApi, makeComponentsNullable]);

  return action;
};
