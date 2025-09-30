import React, { FC, PropsWithChildren, useMemo, useRef } from "react";
import DataContextBinder from "../dataContextBinder";
import { SheshaCommonContexts } from "../../dataContextManager/models";
import { DataTypes, IObjectMetadata, TypeDefinition, useDataContextManagerActions } from "@/index";
import { WebStorageProxy } from "./webStorageProxy";
import { webStorageCode } from '@/publicJsApis';
import { splitDotNotation } from "@/utils/dotnotation";


export const WebStorageContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => Promise.resolve({ typeName: 'IWebStorage', files: [{ content: webStorageCode as string, fileName: 'apis/webStorage.ts' }] } satisfies TypeDefinition),
    properties: [{ path: 'local', dataType: DataTypes.object }, { path: 'session', dataType: DataTypes.object }],
    dataType: DataTypes.object,
  } as IObjectMetadata), []);

  const manager = useDataContextManagerActions();
  const localStorage = useRef<WebStorageProxy>(new WebStorageProxy('localStorage'));
  localStorage.current.updateOnChangeHandler(manager.onChangeContextData);
  const sessionStorage = useRef<WebStorageProxy>(new WebStorageProxy('sessionStorage'));
  sessionStorage.current.updateOnChangeHandler(manager.onChangeContextData);

  const setItem = (key: string, value: unknown): void => {
    const [storage, path] = splitDotNotation(key);
    if (!path)
      return;
    switch (storage) {
      case 'session':
        sessionStorage.current.setItem(path, value);
        return;
      case 'local':
        localStorage.current.setItem(path, value);
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
        return sessionStorage.current.getItem(path);
      case 'local':
        return localStorage.current.getItem(path);
      default:
        return undefined;
    }
  };
  const setFieldValue = (name: string, value: unknown): void => setItem(name, value);
  const getFieldValue = (name: string): unknown => getItem(name);

  const data = { local: localStorage.current, session: sessionStorage.current };

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
