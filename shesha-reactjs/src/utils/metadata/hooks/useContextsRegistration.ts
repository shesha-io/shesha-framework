import { isPropertiesArray } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "../metadataBuilder";
import { isDefined } from "@/utils/nullables";
import { IDataContextDescriptor } from "@/providers/dataContextManager/models";

export const getContextWithProperties = (builder: IObjectMetadataBuilder, context: IDataContextDescriptor): void => {
  const meta = context.metadata;
  if (isDefined(meta) && (meta.properties?.length || meta.methods?.length || meta.typeDefinitionLoader)) {
    builder.addObject(context.name, context.description, (builder) => {
      if (meta.typeDefinitionLoader)
        builder.setTypeDefinition(meta.typeDefinitionLoader);
      if (isPropertiesArray(meta.properties))
        builder.setProperties(meta.properties);
      if (meta.methods && Array.isArray(meta.methods))
        builder.setMethods(meta.methods);
      return builder;
    });
  } else {
    builder.addObject(context.name, context.description, (builder) => {
      builder.addAny('[key: string]', 'fields');
    });
  }
};
