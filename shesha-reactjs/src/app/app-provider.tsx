'use client';

import React, { FC, PropsWithChildren } from 'react';
import { GlobalStateProvider, ShaApplicationProvider } from '@/providers';
import { useNextRouter } from '@/hooks/useNextRouter';
import { StandardApis } from '@/providers/dynamicActions/implementations/standardApis';
import { MonacoLoaderSettings } from '@/providers/monacoLoader/models';
export interface IAppProviderProps {
  backendUrl: string;
}

const monacoSettings: MonacoLoaderSettings = { localPath: "/monaco/vs" };

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
  const nextRouter = useNextRouter();

  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path.includes('/no-auth')}
        monaco={monacoSettings}
      >
        <StandardApis>
          {children}
        </StandardApis>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
