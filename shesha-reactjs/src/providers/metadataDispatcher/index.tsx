import {
  NestedPropertyMetadatAccessor,
} from './contexts';
import {
  ModelTypeIdentifier,
  IObjectMetadata,
} from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { MetadataFetcher } from '@/utils/metadata/metadataBuilder';
import { useEntityMetadataFetcher } from './entities/provider';
import { IEntityMetadataFetcher } from './entities/models';
import { MetadataDispatcherProvider, useMetadataDispatcher } from './provider';
import { IEntityTypeIndentifier } from '../sheshaApplication/publicApi/entities/models';


const useNestedPropertyMetadatAccessor = (modelType: string | IEntityTypeIndentifier): NestedPropertyMetadatAccessor => {
  const dispatcher = useMetadataDispatcher();

  const accessor: NestedPropertyMetadatAccessor = (propertyPath: string) => modelType
    ? dispatcher.getPropertyMetadata({ dataType: DataTypes.entityReference, modelType, propertyPath })
    : Promise.resolve(null);

  return accessor;
};

const useMetadataFetcher = (): MetadataFetcher => {
  const { getMetadata } = useMetadataDispatcher();
  const metadataFetcher = (typeId: ModelTypeIdentifier): Promise<IObjectMetadata | null> => getMetadata({ dataType: DataTypes.entityReference, modelType: typeId });
  return metadataFetcher;
};

export {
  MetadataDispatcherProvider,
  useMetadataDispatcher,
  useNestedPropertyMetadatAccessor,
  useMetadataFetcher,
  type IEntityMetadataFetcher,
  useEntityMetadataFetcher,
};
