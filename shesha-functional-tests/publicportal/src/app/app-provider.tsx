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
import { AppProgressBar } from "next-nprogress-bar";
import { useTheme } from "antd-style";
import { OrganisationsActionsProvider } from "@/components/dynamic-list/dynamic-actions";

export interface IAppProviderProps {
  backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({
  children,
  backendUrl,
}) => {
  const nextRouter = useNextRouter();
  const theme = useTheme();

  return (
    <GlobalStateProvider>
      <AppProgressBar height="4px" color={theme.colorPrimary} shallowRouting />
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path?.includes("/no-auth")}
        applicationKey="public-portal"
      >
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
