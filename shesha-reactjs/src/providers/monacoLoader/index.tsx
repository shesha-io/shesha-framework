/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import React, { createContext, FC, PropsWithChildren } from 'react';
import { DEFAULT_MONACO_LOADER_SETTINGS, MonacoLoaderSettings } from './models';

export type MonacoLoaderProviderProps = MonacoLoaderSettings;

export const MonacoLoaderSettingsContext = createContext<MonacoLoaderSettings | undefined>(undefined);

export const MonacoLoaderProvider: FC<PropsWithChildren<MonacoLoaderProviderProps>> = ({ children, ...props }) => {
  return (
    <MonacoLoaderSettingsContext.Provider value={props}>
      {children}
    </MonacoLoaderSettingsContext.Provider>
  );
};

export const ConditionalMonacoProvider: FC<PropsWithChildren<{ monaco: MonacoLoaderProviderProps | undefined }>> = ({ children, monaco }) => {
  return monaco ? <MonacoLoaderProvider {...monaco}>{children}</MonacoLoaderProvider> : <>{children}</>;
};

export const useMonacoLoaderSettings = (): MonacoLoaderSettings => React.useContext(MonacoLoaderSettingsContext) ?? DEFAULT_MONACO_LOADER_SETTINGS;
