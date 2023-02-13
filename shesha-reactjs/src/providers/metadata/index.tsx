import React, { FC, useContext, PropsWithChildren, useEffect } from 'react';
import metadataReducer from './reducer';
import {
  METADATA_CONTEXT_INITIAL_STATE,
  IMetadataStateContext,
  IMetadataActionsContext,
  IMetadataContext,
  MetadataContext,
} from './contexts';
import { setMetadataAction } from './actions';
import useThunkReducer from 'react-hook-thunk-reducer';
import { useMetadataDispatcher } from '../../providers';
import { ProperyDataType } from '../../interfaces/metadata';

export interface IMetadataProviderProps {
  id?: string;
  modelType: string;
}

interface IMetadataOptions {
  filters: ProperyDataType[];
}

const MetadataProvider: FC<PropsWithChildren<IMetadataProviderProps>> = ({ id, modelType, children }) => {
  const initial: IMetadataStateContext = {
    ...METADATA_CONTEXT_INITIAL_STATE,
    id,
    modelType,
  };

  const [state, dispatch] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { registerProvider, getMetadata: fetchMeta } = useMetadataDispatcher();

  useEffect(() => {
    if (modelType)
      fetchMeta({ modelType }).then(meta => {
        dispatch(setMetadataAction({ metadata: meta }));
      });
  }, [modelType]);

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

function useMetadata(require: boolean, options?: IMetadataOptions) {
  const context = useContext(MetadataContext);
  const { filters = [] } = options || {};

  if (context === undefined && require) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }

  if (filters.length) {
    const properties = (context?.metadata?.properties || []).filter(({ dataType }) =>
      filters.includes(dataType as ProperyDataType)
    );

    return { ...context, metadata: { ...context?.metadata, properties } } as IMetadataContext;
  }

  return context;
}

export { MetadataProvider, useMetadata };
