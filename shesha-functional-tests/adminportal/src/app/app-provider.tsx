"use client";

import { FC, PropsWithChildren } from 'react';
import {
  GlobalStateProvider,
  ShaApplicationProvider,
  useNextRouter,
  MonacoLoaderSettings,
  IHttpHeadersDictionary,
} from '@shesha-io/reactjs';
import { OrganisationsActionsProvider } from '@/components/dynamic-list/dynamic-actions';

export interface IAppProviderProps {
  backendUrl: string;
}

const monacoSettings: MonacoLoaderSettings = { localPath: "/monaco/vs" };

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
  const nextRouter = useNextRouter();
  const buildHttpHeaders = (): IHttpHeadersDictionary => {
    return {
      'Organisation-Id': 'Testing',
    };
  };
  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path.includes('/no-auth')}
        buildHttpRequestHeaders={buildHttpHeaders}
        monaco={monacoSettings}
      >
        <OrganisationsActionsProvider>
          {children}
        </OrganisationsActionsProvider>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
