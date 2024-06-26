"use client";

import React, { FC, PropsWithChildren } from "react";
import {
  GlobalStateProvider,
  ShaApplicationProvider,
  StoredFilesProvider,
  useNextRouter,
} from "@shesha-io/reactjs";
import { AppProgressBar } from "next-nprogress-bar";
import { useTheme } from "antd-style";
import { MainLayout } from "@/components";
import { LOGO } from "@/app-constants";
import { GlobalPublicPortalStyles } from "@/styles/global";

export interface IAppProviderProps {
  backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({
  children,
  backendUrl,
}) => {
  const nextRouter = useNextRouter();
  const theme = useTheme();

  const noAuthRoutes = [
    "/no-auth",
    "/login",
    "/account/forgot-password",
    "/account/reset-password",
  ];
  const noAuth = Boolean(
    noAuthRoutes.find((r) => nextRouter.path?.includes(r))
  );

  return (
    <GlobalStateProvider>
      <AppProgressBar height="4px" color={theme.colorPrimary} shallowRouting />
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={false}
      >
        <GlobalPublicPortalStyles />
        <StoredFilesProvider baseUrl={backendUrl} ownerId={""} ownerType={""}>
          {noAuth ? (
            <>{children}</>
          ) : (
            <MainLayout imageProps={LOGO}>{children}</MainLayout>
          )}
        </StoredFilesProvider>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
