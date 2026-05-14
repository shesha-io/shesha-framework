'use client';

import React, { FC, PropsWithChildren } from 'react';
import { GlobalStateProvider, ShaApplicationProvider } from '@/providers';
import { useNextRouter } from '@/hooks/useNextRouter';
import { StandardApis } from '@/providers/dynamicActions/implementations/standardApis';

export interface IAppProviderProps {
  backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
  const nextRouter = useNextRouter();

  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path?.includes('/no-auth')}
      >
        <StandardApis>
          {children}
        </StandardApis>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
