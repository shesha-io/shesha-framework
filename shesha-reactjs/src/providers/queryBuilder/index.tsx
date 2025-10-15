import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import QueryBuilderReducer from './reducer';
import { QueryBuilderActionsContext, QueryBuilderStateContext, QUERY_BUILDER_CONTEXT_INITIAL_STATE, IQueryBuilderStateContext, IQueryBuilderActionsContext } from './contexts';
import {
  setFieldsAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { IHasQueryBuilderConfig, IProperty, IPropertyMetadataWithQBSettings, propertyHasQBConfig } from './models';
import { getPropertyFullPath, propertyMetadata2QbProperty, useMetadataFields } from './utils';
import { useMetadataDispatcher } from '@/providers';
import { IModelMetadata, asPropertiesArray, isEntityMetadata } from '@/interfaces/metadata';
import { Widgets } from '@react-awesome-query-builder/antd';

export interface IQueryBuilderProviderProps {
  metadata: IModelMetadata;
  id?: string; // Just for testing
  customWidgets?: Widgets;
}

const QueryBuilderProvider: FC<PropsWithChildren<IQueryBuilderProviderProps>> = ({ children, customWidgets, metadata, id }) => {
  const [state, dispatch] = useReducer(QueryBuilderReducer, {
    ...QUERY_BUILDER_CONTEXT_INITIAL_STATE,
    fields: [],
    customWidgets,
    id,
  });

  const { getContainerMetadata } = useMetadataDispatcher();
  const setFields = (newFields: IProperty[]): void => {
    dispatch(setFieldsAction(newFields));
  };

  const getPropertiesFromMeta = (modelMeta: IModelMetadata, prefix: string): IProperty[] => {
    // handle properties
    const properties = asPropertiesArray(modelMeta.properties, []).map((p) => {
      const qbProp = propertyMetadata2QbProperty(p);
      qbProp.propertyName = getPropertyFullPath(p.path, prefix);
      return qbProp;
    });
    // handle specifications
    if (isEntityMetadata(modelMeta)) {
      modelMeta.specifications.forEach((specification) => {
        const containerNames = specification.name.split('.');
        const nodeName = containerNames.pop();

        let containerNode: IProperty = null;

        // process all containers
        containerNames.forEach((containerName) => {
          const container = containerNode
            ? containerNode.childProperties
            : properties;

          containerNode = (container).find((p) => p.propertyName === containerName);

          if (!containerNode) {
            containerNode = {
              dataType: '!struct',
              label: containerName,
              visible: true,
              propertyName: containerName,
              childProperties: [],
            };
            container.push(containerNode);
          }

          if (!containerNode.childProperties)
            containerNode.childProperties = [];
        });

        // add leaf node
        const leafNode = {
          dataType: 'specification',
          label: specification.friendlyName,
          visible: true,
          propertyName: nodeName,
        };
        (containerNode?.childProperties ?? properties).push(leafNode);
      });
    }

    return properties;
  };

  const fetchFields = (fieldNames: string[]): void => {
    if (!metadata?.properties)
      return;

    const containers: string[] = [null/* to ensure that root is loaded*/];
    fieldNames.forEach((f) => {
      const idx = f.lastIndexOf('.');
      const container = idx === -1
        ? null
        : f.substring(0, idx);
      if (containers.indexOf(container) === -1)
        containers.push(container);
    });

    const promises = containers.map((prefix) =>
      getContainerMetadata({ metadata: metadata, containerPath: prefix })
        .then((response) => getPropertiesFromMeta(response, prefix)),
    );

    Promise.allSettled(promises).then((results) => {
      const missingProperties: IProperty[] = [];

      results.filter((r) => r.status === 'fulfilled').forEach((r) => {
        const properties = (r as PromiseFulfilledResult<IProperty[]>)?.value ?? [];
        properties.forEach((prop) => {
          if (!state.fields.find((p) => p.propertyName === prop.propertyName))
            missingProperties.push(prop);
        });
      });

      // add unknown fields TODO: find a good way to handle these fields
      const unknownFields = fieldNames.filter((f) => !missingProperties.find((p) => p.propertyName === f));
      if (unknownFields.length > 0) {
        unknownFields.forEach((f) => {
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
    const promise = getContainerMetadata({ metadata: metadata, containerPath: containerPath });

    promise.then((response) => {
      const properties = getPropertiesFromMeta(response, containerPath);
      const missingProperties = properties.filter((prop) => !state.fields.find((p) => p.propertyName === prop.propertyName));
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

function useQueryBuilderState(requireBuilder: boolean = true): IQueryBuilderStateContext | undefined {
  const context = useContext(QueryBuilderStateContext);

  if (context === undefined && requireBuilder) {
    throw new Error('useQueryBuilderState must be used within a QueryBuilderProvider');
  }

  return context;
}

function useQueryBuilderActions(requireBuilder: boolean = true): IQueryBuilderActionsContext | undefined {
  const context = useContext(QueryBuilderActionsContext);

  if (context === undefined && requireBuilder) {
    throw new Error('useQueryBuilderActions must be used within a QueryBuilderProvider');
  }

  return context;
}

function useQueryBuilder(requireBuilder: boolean = true): IQueryBuilderStateContext & IQueryBuilderActionsContext | undefined {
  const actionsContext = useQueryBuilderActions(requireBuilder);
  const stateContext = useQueryBuilderState(requireBuilder);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when requireBuilder == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export {
  QueryBuilderProvider,
  useQueryBuilderState,
  useQueryBuilderActions,
  useQueryBuilder,
  useMetadataFields,
  type IHasQueryBuilderConfig,
  propertyHasQBConfig,
  type IPropertyMetadataWithQBSettings,
};
