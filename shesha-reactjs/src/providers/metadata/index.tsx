import React, { FC, useContext, PropsWithChildren, useEffect, useMemo } from 'react';
import metadataReducer from './reducer';
import {
  METADATA_CONTEXT_INITIAL_STATE,
  IMetadataStateContext,
  IMetadataActionsContext,
  IMetadataContext,
  MetadataContext,
  MetadataType,
} from './contexts';
import { setMetadataAction } from './actions';
import useThunkReducer from '../../hooks/thunkReducer';
import { useMetadataDispatcher } from '../../providers';
import { IPropertyMetadata, ProperyDataType } from 'interfaces/metadata';

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
  const { registerProvider, getMetadata: fetchMeta } = useMetadataDispatcher();

  useEffect(() => {
    if (modelType)
      fetchMeta({ modelType, dataType }).then(meta => {
        dispatch(setMetadataAction({ metadata: meta, dataType, modelType }));
      });
  }, [modelType, dataType]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const getMetadata = () => {
    return fetchMeta({ modelType });
  };

  const metadataActions: IMetadataActionsContext = {
    /* NEW_ACTION_GOES_HERE */
    getMetadata,
  };

  const contextValue: IMetadataContext = { ...state, ...metadataActions };
  registerProvider({ id, modelType, contextValue });

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
    const { properties = [] } = meta?.metadata ?? {};
    return dataTypes
      ? properties.filter(({ dataType }) =>
        dataTypes.includes(dataType as ProperyDataType)
      )
      : properties;
  }, [meta, dataTypes]);

  return properties;
};

export { MetadataProvider, useMetadata, useMetaProperties };