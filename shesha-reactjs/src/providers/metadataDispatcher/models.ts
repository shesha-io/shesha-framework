import { IModelMetadata } from '@/interfaces/metadata';

export interface IModelsDictionary {
  [key: string]: Promise<IModelMetadata | null> | undefined;
}
