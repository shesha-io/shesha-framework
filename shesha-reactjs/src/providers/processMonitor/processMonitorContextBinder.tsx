import React, { FC, PropsWithChildren, useMemo } from 'react';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { IProcessMonitor } from './interfaces';
import { DataTypes, IObjectMetadata } from '@/interfaces';
import processMonitorContextCode from './publicJsApi/processMonitorContextCode.ts?raw';
import { useProcessMonitorSubscription } from './hooks';

export interface IProcessMonitorContextBinderProps {
  contextName: string;
  instance: IProcessMonitor;
}

export const ProcessMonitorContextBinder: FC<PropsWithChildren<IProcessMonitorContextBinderProps>> = ({ contextName, children, instance }) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'IProcessMonitorApi',
        files: [{ content: processMonitorContextCode, fileName: 'apis/processMonitorApi.ts' }],
      });
    },
    properties: [],
    dataType: DataTypes.object,
  }), []);

  useProcessMonitorSubscription(instance, "events");
  useProcessMonitorSubscription(instance, "status");

  const { events, status, clearLog } = instance;
  const publicApi = useMemo(() => {
    return { events, status, clearLog };
  }, [events, status, clearLog]);

  return (
    <DataContextBinder
      id={contextName}
      name={contextName}
      description={`Process Monitor context: ${contextName}`}
      type="control"
      data={publicApi}
      api={instance}
      metadata={contextMetadata}
    >
      {children}
    </DataContextBinder>
  );
};
