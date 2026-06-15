import {
  NestedPropertyMetadatAccessor,
} from './contexts';
import {
  ModelTypeIdentifier,
  IObjectMetadata,
  isObjectMetadata,
} from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { MetadataFetcher } from '@/utils/metadata/metadataBuilder';
import { useEntityMetadataFetcher } from './entities/provider';
import { IEntityMetadataFetcher } from './entities/models';
import { MetadataDispatcherProvider, useMetadataDispatcher } from './provider';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { isDefined } from '@/utils/nullables';


const useNestedPropertyMetadatAccessor = (modelType: string | IEntityTypeIdentifier | undefined): NestedPropertyMetadatAccessor => {
  const dispatcher = useMetadataDispatcher();

  const accessor: NestedPropertyMetadatAccessor = (propertyPath: string) => modelType
    ? dispatcher.getPropertyMetadata({ dataType: DataTypes.entityReference, modelType, propertyPath })
    : Promise.resolve(null);

  return accessor;
};

const useMetadataFetcher = (): MetadataFetcher => {
  const { getMetadata } = useMetadataDispatcher();
  const metadataFetcher = async (typeId: ModelTypeIdentifier): Promise<IObjectMetadata | null> => {
    const metadata = await getMetadata({ dataType: DataTypes.entityReference, modelType: typeId });
    return isDefined(metadata) && isObjectMetadata(metadata)
      ? metadata
      : null;
  };
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
