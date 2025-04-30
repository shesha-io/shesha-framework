import React, { FC, PropsWithChildren, useMemo, useRef } from "react";
import DataContextBinder from "../dataContextBinder";
import { SheshaCommonContexts } from "../../dataContextManager/models";
import { DataTypes, IObjectMetadata, useDataContextManagerActions } from "@/index";
import { WebStorageProxy } from "./webStorageProxy";
import { webStorageCode } from '@/publicJsApis';


export const WebStorageContextProvider: FC<PropsWithChildren<any>> = (props) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => Promise.resolve({ typeName: 'IWebStorage', files: [{ content: webStorageCode, fileName: 'apis/webStorage.ts' }]}),
    properties: [{path: 'local', dataType: DataTypes.object}, {path: 'session', dataType: DataTypes.object}],
    dataType: DataTypes.object
  } as IObjectMetadata), []);

  const manager = useDataContextManagerActions();
  const localStorage = useRef<WebStorageProxy>(new WebStorageProxy('localStorage'));
  localStorage.current.updateOnChangeHandler(manager.onChangeContextData);
  const sessionStorage = useRef<WebStorageProxy>(new WebStorageProxy('sessionStorage'));
  sessionStorage.current.updateOnChangeHandler(manager.onChangeContextData);

  const setItem = (key: string, value: any) => {
    const parts = key.split('.');
    if (parts[0] === 'session') 
      sessionStorage.current.setItem(parts[1], value);
    if (parts[0] === 'local')
      localStorage.current.setItem(parts[1], value);
  };
  const getItem = (key: string) => {
    const parts = key.split('.');
    if (parts[0] === 'session') 
      return sessionStorage.current.getItem(parts[1]);
    if (parts[0] === 'local')
      return localStorage.current.getItem(parts[1]);
    return null;
  };
  const setFieldValue = (name: string, value: any) => setItem(name, value);
  const getFieldValue = (name: string) => getItem(name);

  const data = { local: localStorage.current, session: sessionStorage.current };

  return (
    <DataContextBinder
      id={SheshaCommonContexts.WebStorageContext}
      name={SheshaCommonContexts.WebStorageContext}
      description={'Web local storage access context'}
      type={'storage'}
      data={data}
      metadata={contextMetadata}
      setFieldValue={setFieldValue}
      getFieldValue={getFieldValue}
      getData={() => data}
    >
      {props.children}
    </DataContextBinder>
  );
};