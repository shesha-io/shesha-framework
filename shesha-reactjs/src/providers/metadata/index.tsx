import React, { FC, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useThunkReducer from '@/hooks/thunkReducer';
import { IPropertyMetadata, ProperyDataType, asPropertiesArray } from '@/interfaces/metadata';
import { useMetadataDispatcher } from '@/providers';
import { setMetadataAction } from './actions';
import {
  IMetadataActionsContext,
  IMetadataContext,
  IMetadataStateContext,
  METADATA_CONTEXT_INITIAL_STATE,
  MetadataContext,
  MetadataType,
} from './contexts';
import metadataReducer from './reducer';
import camelcase from 'camelcase';

export interface IMetadataProviderProps {
  id?: string;
  modelType: string;
  dataType?: MetadataType;
}

const MetadataProvider: FC<PropsWithChildren<IMetadataProviderProps>> = ({ id, modelType, dataType = 'entity', children }) => {
  const initial: IMetadataStateContext = {
    ...METADATA_CONTEXT_INITIAL_STATE,
    id,
    modelType,
    dataType
  };

  const [state, dispatch] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { getMetadata } = useMetadataDispatcher();

  useEffect(() => {
    if (modelType) {
      getMetadata({ modelType, dataType }).then(meta => {
        dispatch(setMetadataAction({ metadata: meta, dataType, modelType }));
      });
    }
  }, [modelType, dataType]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  // const getMetadata = () => {
  //   return fetchMeta({ dataType, modelType });
  // };

  const getPropertyMeta = (name: string): IPropertyMetadata => {
    return asPropertiesArray(state.metadata?.properties, []).find(p => camelcase(p.path) === name);
  };

  const metadataActions: IMetadataActionsContext = {
    /* NEW_ACTION_GOES_HERE */
    // getMetadata,
    getPropertyMeta,
  };

  const contextValue: IMetadataContext = { ...state, ...metadataActions };

  return <MetadataContext.Provider value={contextValue}>{children}</MetadataContext.Provider>;
};

function useMetadata(require: boolean) {
  const context = useContext(MetadataContext);

  if (context === undefined && require) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }

  return context;
}

/**
 * Get list of properties filtered by data type
 *
 * @param dataTypes data types filter
 * @returns
 */
const useMetaProperties = (dataTypes: ProperyDataType[]): IPropertyMetadata[] => {
  const meta = useMetadata(false);

  const properties = useMemo(() => {
    const { properties: metaProperties } = meta?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    return dataTypes
      ? properties.filter(({ dataType }) => dataTypes.includes(dataType as ProperyDataType))
      : properties;
  }, [meta, dataTypes]);

  return properties;
};

export { MetadataProvider, useMetaProperties, useMetadata };
