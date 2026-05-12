import React, { FC, useContext, PropsWithChildren, useState } from 'react';
import { QueryBuilderActionsContext, QueryBuilderStateContext, IQueryBuilderStateContext, IQueryBuilderActionsContext } from './contexts';
import { IHasQueryBuilderConfig, IProperty, IPropertyMetadataWithQBSettings, propertyHasQBConfig } from './models';
import { getPropertyFullPath, propertyMetadata2QbProperty } from './utils';
import { useMetadataDispatcher } from '@/providers';
import { IModelMetadata, asPropertiesArray, isEntityMetadata } from '@/interfaces/metadata';
import { Widgets } from '@react-awesome-query-builder/antd';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IQueryBuilderProviderProps {
  metadata: IModelMetadata;
  id?: string; // Just for testing
  customWidgets?: Widgets;
}

const getContainerNode = (properties: IProperty[], containerNames: string[]): IProperty | undefined => {
  let containerNode: IProperty | undefined = undefined;
  containerNames.forEach((containerName) => {
    const container = containerNode
      ? containerNode.childProperties
      : properties;

    containerNode = container.find((p) => p.propertyName === containerName);

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
  });
  return containerNode;
};

const QueryBuilderProvider: FC<PropsWithChildren<IQueryBuilderProviderProps>> = ({ children, customWidgets, metadata, id }) => {
  const [fields, setFields] = useState<IProperty[]>([]);

  const { getContainerMetadata } = useMetadataDispatcher();

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
        if (isNullOrWhiteSpace(nodeName))
          return;

        const containerNode = getContainerNode(properties, containerNames);

        // add leaf node
        const leafNode: IProperty = {
          dataType: 'specification',
          label: specification.friendlyName,
          visible: true,
          propertyName: nodeName,
          childProperties: [],
        };
        if (isDefined(containerNode)) {
          containerNode.childProperties.push(leafNode);
        } else
          properties.push(leafNode);
      });
    }

    return properties;
  };

  const fetchFields = (fieldNames: string[]): void => {
    if (!metadata.properties)
      return;

    const containers: string[] = [""/* to ensure that root is loaded*/];
    fieldNames.forEach((f) => {
      const idx = f.lastIndexOf('.');
      const container = idx === -1
        ? ""
        : f.substring(0, idx);
      if (containers.indexOf(container) === -1)
        containers.push(container);
    });

    const promises = containers.map((prefix) =>
      getContainerMetadata({ metadata: metadata, containerPath: prefix })
        .then((response) => isDefined(response) ? getPropertiesFromMeta(response, prefix) : []),
    );

    Promise.allSettled(promises).then((results) => {
      const missingProperties: IProperty[] = [];

      results.filter((r) => r.status === 'fulfilled').forEach((r) => {
        const properties = r.value;
        properties.forEach((prop) => {
          if (!fields.find((p) => p.propertyName === prop.propertyName))
            missingProperties.push(prop);
        });
      });

      // add unknown fields TODO: find a good way to handle these fields
      const unknownFields = fieldNames.filter((f) => !missingProperties.find((p) => p.propertyName === f));
      if (unknownFields.length > 0) {
        unknownFields.forEach((f) => {
          missingProperties.push({
            label: f,
            propertyName: f,
            dataType: 'unknown',
            visible: true,
            childProperties: [],
          } satisfies IProperty);
        });
      }

      if (missingProperties.length > 0) {
        const newFields = [...fields, ...missingProperties];

        setFields(newFields);
      }
    })
      .catch((error) => {
        console.error('Failed to fetch query builder fields', error);
      });
  };

  const fetchContainer = (containerPath: string): Promise<IModelMetadata | null> => {
    const promise = getContainerMetadata({ metadata: metadata, containerPath: containerPath });

    return promise.then((response) => {
      const properties = isDefined(response) ? getPropertiesFromMeta(response, containerPath) : [];
      const missingProperties = properties.filter((prop) => !fields.find((p) => p.propertyName === prop.propertyName));
      if (missingProperties.length > 0) {
        const newFields = [...fields, ...missingProperties];

        setFields(newFields);
      }
      return response;
    });
  };

  return (
    <QueryBuilderStateContext.Provider value={{ fields, id, customWidgets }}>
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
  type IHasQueryBuilderConfig,
  propertyHasQBConfig,
  type IPropertyMetadataWithQBSettings,
};
