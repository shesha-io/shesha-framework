import { IMetadata, IObjectMetadata } from "./metadata";

export type PropertiesBuilder<TObjectBuilder extends IObjectMetadataBuilder = IObjectMetadataBuilder> = (builder: TObjectBuilder) => void;

export enum Environment {
  None = 'none',
  FrontEnd = 'front-end',
  BackEnd = 'back-end',
}

export interface StandardConstantWithCustomName {
  uid: string;
  name: string;
}
export type StandardConstantInclusionArgs = string | StandardConstantWithCustomName;

export interface IObjectMetadataBuilder {
  add(dataType: string, path: string, label: string): this;
  addString(path: string, label: string): this;
  addNumber(path: string, label: string): this;
  addDate(path: string, label: string): this;
  addDateTime(path: string, label: string): this;
  addBoolean(path: string, label: string): this;
  addArray(path: string, label: string): this;
  addAny(path: string, label: string): this;
  addEntityAsync(path: string, label: string, entityType: string): Promise<this>;
  addAllStandard(exclusions?: string[]): this;
  addStandard(args: StandardConstantInclusionArgs | StandardConstantInclusionArgs[]): this;
  build(): IObjectMetadata;

  addObject(path: string, label: string, propertiesBuilder?: PropertiesBuilder<this>): this;

  addMetadataBuilder(): this;
}

export interface IMetadataBuilder<TObjectBuilder extends IObjectMetadataBuilder = IObjectMetadataBuilder> {
  isEntityAsync(entityType: string): Promise<boolean>;

  object(name: string, description?: string): TObjectBuilder;
  array(name: string, itemType: (builder: this) => Promise<IMetadata>, description?: string): Promise<IMetadata>;
  entity(entityType: string): Promise<IObjectMetadata>;
  metadata(): IObjectMetadata;

  anyObject(): IMetadata;
  string(): IMetadata;
  number(): IMetadata;
  date(): IMetadata;
  boolean(): IMetadata;
}
