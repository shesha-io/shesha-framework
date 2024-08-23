export const metadataBuilderDefinition = `
export interface IMetadataBuilder {
  add(dataType: string, path: string, label: string): this;
  addString(path: string, label: string): this;
  addNumber(path: string, label: string): this;
  addDate(path: string, label: string): this;
  addBoolean(path: string, label: string): this;
  addArray(path: string, label: string): this;
  addCustom(path: string, label: string, typeDefinitionLoader: TypeDefinitionLoader): this;
  addFunction(path: string, label: string): this;
  addObject(path: string, label: string, propertiesBuilder: PropertiesBuilder): this;
  isEntityAsync(entityType: string): Promise<boolean>;
  addEntityAsync(path: string, label: string, entityType: string): Promise<this>;
  addStandard(args: StandardConstantInclusionArgs | StandardConstantInclusionArgs[]): this;
  addAllStandard(exclusions?: string[]): this;
  addRefList(path: string, refListId: IReferenceListIdentifier, label: string): this;
  setPropertiesLoader(loader: PropertiesLoader): this;
  setProperties(properties: IPropertyMetadata[]);
  setTypeDefinition(typeDefinitionLoader: TypeDefinitionLoader): this;
  build(): IObjectMetadata;
}
`;