"use client";

import React, { FC, PropsWithChildren } from "react";
import {
  GlobalStateProvider,
  ShaApplicationProvider,
  StoredFilesProvider,
  useNextRouter,
} from "@shesha-io/reactjs";
import {
  GlobalPublicPortalStyles,
  PublicPortalApplicationPlugin,
} from "@shesha-io/pd-publicportal";

export interface IAppProviderProps {
  backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({
  children,
  backendUrl,
}) => {
  const nextRouter = useNextRouter();

  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path?.includes("/no-auth")}
        applicationKey="public-portal"
      >
        <GlobalPublicPortalStyles />
        <PublicPortalApplicationPlugin>
          <StoredFilesProvider baseUrl={backendUrl} ownerId={""} ownerType={""}>
            {children}
          </StoredFilesProvider>
        </PublicPortalApplicationPlugin>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
