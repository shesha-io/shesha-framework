import { IModelMetadata, ISpecification } from '@/interfaces/metadata';

export interface IProperty {
  name: string;
  displayName: string;
  description?: string;
}

export interface IModelsDictionary {
  [key: string]: Promise<IModelMetadata> | undefined;
}

export interface ISpecificationsDictionary {
  [key: string]: Promise<ISpecification[]>;
}
