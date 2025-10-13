import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { IPropertyMetadata, asPropertiesArray } from '@/interfaces/metadata';
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

const MetadataProvider: FC<PropsWithChildren<IMetadataProviderProps>> = ({ id = null, modelType, dataType = 'entity', children }) => {
  const initial: IMetadataStateContext = {
    ...METADATA_CONTEXT_INITIAL_STATE,
    id,
    modelType,
    dataType,
  };

  const [state, dispatch] = useReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { getMetadata } = useMetadataDispatcher();

  useEffect(() => {
    if (modelType) {
      getMetadata({ modelType, dataType }).then((meta) => {
        dispatch(setMetadataAction({ metadata: meta, dataType, modelType }));
      });
    }
  }, [modelType, dataType, getMetadata, dispatch]);

  const getPropertyMeta = (name: string): IPropertyMetadata | undefined => {
    return state.metadata
      ? asPropertiesArray(state.metadata.properties, []).find((p) => camelcase(p.path) === name)
      : undefined;
  };

  const metadataActions: IMetadataActionsContext = {
    getPropertyMeta,
  };

  const contextValue: IMetadataContext = { ...state, ...metadataActions };

  return <MetadataContext.Provider value={contextValue}>{children}</MetadataContext.Provider>;
};

const useMetadata = (require: boolean): IMetadataContext | undefined => {
  const context = useContext(MetadataContext);

  if (context === undefined && require) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }

  return context;
};

const ConditionalMetadataProvider: FC<PropsWithChildren<IMetadataProviderProps>> = (props) => {
  return props.modelType
    ? (
      <MetadataProvider {...props}>
        {props.children}
      </MetadataProvider>
    )
    : (
      <>
        {props.children}
      </>
    );
};

export { MetadataProvider, ConditionalMetadataProvider, useMetadata };
