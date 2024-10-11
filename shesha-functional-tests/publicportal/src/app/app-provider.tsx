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
import { OrganisationsActionsProvider } from "@/components/dynamic-list/dynamic-actions";
import { ProgressBar } from "./progressBar";

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
        <ProgressBar />
        <GlobalPublicPortalStyles />
        <PublicPortalApplicationPlugin>
          <OrganisationsActionsProvider>
            <StoredFilesProvider baseUrl={backendUrl} ownerId={""} ownerType={""}>
              {children}
            </StoredFilesProvider>
          </OrganisationsActionsProvider>
        </PublicPortalApplicationPlugin>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
