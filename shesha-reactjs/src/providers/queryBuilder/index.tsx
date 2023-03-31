import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import QueryBuilderReducer from './reducer';
import { QueryBuilderActionsContext, QueryBuilderStateContext, QUERY_BUILDER_CONTEXT_INITIAL_STATE } from './contexts';
import {
  setFieldsAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { IProperty } from './models';
import { getPropertyFullPath, propertyMetadata2QbProperty, useMetadataFields } from './utils';
import { useMetadataDispatcher } from '../metadataDispatcher';
import { useMetadata } from '../metadata';
import { IModelMetadata } from '../../interfaces/metadata';

export interface IQueryBuilderProviderProps {
  fields?: IProperty[];
  id?: string; // Just for testing
}

const QueryBuilderProvider: FC<PropsWithChildren<IQueryBuilderProviderProps>> = ({ children, fields, id }) => {
  const [state, dispatch] = useReducer(QueryBuilderReducer, {
    ...QUERY_BUILDER_CONTEXT_INITIAL_STATE,
    fields: fields || [],
    id,
  });

  const { getContainerMetadata } = useMetadataDispatcher();
  const meta = useMetadata(false);

  const setFields = (newFields: IProperty[]) => {
    dispatch(setFieldsAction(newFields));
  };

  const getPropertiesFromMeta = (modelMeta: IModelMetadata, prefix: string): IProperty[] => {
    // handle properties
    const properties = modelMeta.properties.map(p => {
      const qbProp = propertyMetadata2QbProperty(p);
      qbProp.propertyName = getPropertyFullPath(p.path, prefix);
      return qbProp;
    });
    // handle specifications
    modelMeta.specifications.forEach(specification => {
      const allParts = specification.name.split('.');
      allParts.pop();
      let nsPath = null;
      allParts.forEach(ns => {
        nsPath = nsPath ? `${nsPath}.${ns}` : ns;
        const existingProp = properties.find(p => p.propertyName === ns);
        if (!existingProp)
          properties.push({
            dataType: '!struct',
            label: nsPath,
            visible: true,
            propertyName: nsPath,
          });
      });

      properties.push({
        propertyName: specification.name,
        label: specification.friendlyName,
        dataType: 'specification',
        visible: true
      });
    });
    return properties;

  };

  const fetchFields = (fieldNames: string[]) => {
    if (!meta?.metadata?.properties)
      return;

    const containers: string[] = [null/*to ensure that root is loaded*/];
    fieldNames.forEach(f => {
      const idx = f.lastIndexOf('.');
      const container = idx === -1
        ? null
        : f.substring(0, idx);
      if (containers.indexOf(container) === -1)
        containers.push(container);
    });

    const promises = containers.map(prefix =>
      getContainerMetadata({ metadata: meta.metadata, containerPath: prefix })
        .then(response => getPropertiesFromMeta(response, prefix))
    );

    Promise.allSettled(promises).then(results => {
      const missingProperties: IProperty[] = [];

      results.filter(r => r.status === 'fulfilled').forEach(r => {
        const properties = (r as PromiseFulfilledResult<IProperty[]>)?.value ?? [];
        properties.forEach(prop => {
          if (!state.fields.find(p => p.propertyName === prop.propertyName))
            missingProperties.push(prop);
        });
      });

      // add unknown fields todo: find a good way to handle these fields
      const unknownFields = fieldNames.filter(f => !missingProperties.find(p => p.propertyName === f));
      if (unknownFields.length > 0) {
        unknownFields.forEach(f => {
          missingProperties.push({ label: f, propertyName: f, dataType: 'unknown', visible: true });
        });
      }

      if (missingProperties.length > 0) {
        const newFields = [...state.fields, ...missingProperties];

        setFields(newFields);
      }
    });
  };

  const fetchContainer = (containerPath: string): Promise<IModelMetadata> => {
    const promise = getContainerMetadata({ metadata: meta.metadata, containerPath: containerPath });
    
    promise.then(response => {
      const properties = getPropertiesFromMeta(response, containerPath);
      const missingProperties = properties.filter(prop => !state.fields.find(p => p.propertyName === prop.propertyName));
      if (missingProperties.length > 0) {
        const newFields = [...state.fields, ...missingProperties];

        setFields(newFields);
      }
    });

    return promise;
  };

  return (
    <QueryBuilderStateContext.Provider value={{ ...state }}>
      <QueryBuilderActionsContext.Provider
        value={{
          setFields,
          fetchFields,
          fetchContainer,
        }}
      >
        {children}
      </QueryBuilderActionsContext.Provider>
    </QueryBuilderStateContext.Provider>
  );
};

function useQueryBuilderState(requireBuilder: boolean = true) {
  const context = useContext(QueryBuilderStateContext);

  if (context === undefined && requireBuilder) {
    throw new Error('useQueryBuilderState must be used within a QueryBuilderProvider');
  }

  return context;
}

function useQueryBuilderActions(requireBuilder: boolean = true) {
  const context = useContext(QueryBuilderActionsContext);

  if (context === undefined && requireBuilder) {
    throw new Error('useQueryBuilderActions must be used within a QueryBuilderProvider');
  }

  return context;
}

function useQueryBuilder(requireBuilder: boolean = true) {
  const actionsContext = useQueryBuilderActions(requireBuilder);
  const stateContext = useQueryBuilderState(requireBuilder);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when requireBuilder == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export { QueryBuilderProvider, useQueryBuilderState, useQueryBuilderActions, useQueryBuilder, useMetadataFields };
