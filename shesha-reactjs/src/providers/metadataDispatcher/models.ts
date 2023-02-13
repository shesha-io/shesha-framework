import { IModelMetadata, ISpecification } from "../../interfaces/metadata";
import { IMetadataProviderRegistration } from "./contexts";

export interface IProperty {
  name: string;
  displayName: string;
  description?: string;
}

export interface IModelsDictionary {
  [key: string]: Promise<IModelMetadata>;
}

export interface ISpecificationsDictionary {
  [key: string]: Promise<ISpecification[]>;
}

export interface IProvidersDictionary {
  [key: string]: IMetadataProviderRegistration;
}