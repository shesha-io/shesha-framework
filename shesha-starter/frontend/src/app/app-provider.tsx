"use client";

import React, { FC, PropsWithChildren } from "react";
import {
  AttachmentsEditorProvider,
  GlobalStateProvider,
  ShaApplicationProvider,
  useNextRouter,
} from "@shesha-io/reactjs";
import { AppProgressBar } from "next-nprogress-bar";
import { useTheme } from "antd-style";

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
        noAuth={nextRouter.path?.includes('/no-auth')}
      >
        {/* 0.46.0 replaced StoredFilesProvider with AttachmentsEditorProvider.
            It takes no baseUrl - the backend URL comes from ShaApplicationProvider. */}
        <AttachmentsEditorProvider ownerId={""} ownerType={""}>
          {children}
        </AttachmentsEditorProvider>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
