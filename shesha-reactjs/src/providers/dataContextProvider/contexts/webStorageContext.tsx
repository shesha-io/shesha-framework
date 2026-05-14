import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import DataContextBinder from "../dataContextBinder";
import { SheshaCommonContexts } from "../../dataContextManager/models";
import { DataTypes, IObjectMetadata, TypeDefinition } from "@/interfaces";
import { WebStorageProxy } from "./webStorageProxy";
import { webStorageCode } from '@/publicJsApis';
import { splitDotNotation } from "@/utils/dotnotation";
import { useDataContextManagerActions } from "@/providers/dataContextManager/hooks";
import { useDeepCompareMemo } from "@/hooks";


export const WebStorageContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => Promise.resolve({ typeName: 'IWebStorage', files: [{ content: webStorageCode as string, fileName: 'apis/webStorage.ts' }] } satisfies TypeDefinition),
    properties: [{ path: 'local', dataType: DataTypes.object }, { path: 'session', dataType: DataTypes.object }],
    dataType: DataTypes.object,
  } as IObjectMetadata), []);

  const manager = useDataContextManagerActions();
  const [localStorage] = useState<WebStorageProxy>(() => new WebStorageProxy('localStorage'));
  const [sessionStorage] = useState<WebStorageProxy>(() => new WebStorageProxy('sessionStorage'));
  useEffect(() => {
    localStorage.updateOnChangeHandler(manager.onChangeContextData);
    sessionStorage.updateOnChangeHandler(manager.onChangeContextData);
  }, [localStorage, sessionStorage, manager.onChangeContextData]);

  const setItem = (key: string, value: unknown): void => {
    const [storage, path] = splitDotNotation(key);
    if (!path)
      return;
    switch (storage) {
      case 'session':
        sessionStorage.setItem(path, value);
        return;
      case 'local':
        localStorage.setItem(path, value);
        return;
      default:
        return;
    }
  };
  const getItem = (key: string): unknown => {
    const [storage, path] = splitDotNotation(key);
    if (!path)
      return undefined;

    switch (storage) {
      case 'session':
        return sessionStorage.getItem(path);
      case 'local':
        return localStorage.getItem(path);
      default:
        return undefined;
    }
  };
  const setFieldValue = (name: string, value: unknown): void => setItem(name, value);
  const getFieldValue = (name: string): unknown => getItem(name);

  const data = useDeepCompareMemo(() => ({ local: localStorage, session: sessionStorage }), [localStorage, sessionStorage]);

  return (
    <DataContextBinder
      id={SheshaCommonContexts.WebStorageContext}
      name={SheshaCommonContexts.WebStorageContext}
      description="Web local storage access context"
      type="storage"
      data={data}
      metadata={contextMetadata}
      setFieldValue={setFieldValue}
      getFieldValue={getFieldValue}
      getData={() => data}
    >
      {children}
    </DataContextBinder>
  );
};
