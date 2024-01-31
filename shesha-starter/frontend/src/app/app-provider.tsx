"use client";

import {
  GlobalStateProvider,
  MainLayout,
  ShaApplicationProvider,
  StoredFilesProvider,
} from "@shesha/reactjs";
import { useTheme } from "antd-style";
import { AppProgressBar, useRouter } from "next-nprogress-bar";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import React, { FC, PropsWithChildren } from "react";
/* NEW_TOOLBOXCOMPONENT_IMPORT_GOES_HERE */

export interface IAppProviderProps {
  backendUrl: string;
}

const convertSearchParamsToDictionary = (
  params: ReadonlyURLSearchParams
): NodeJS.Dict<string | string[]> => {
  const entries = params.entries();
  const result: NodeJS.Dict<string | string[]> = {};
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
};

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({
  children,
  backendUrl,
}) => {
  const router = useRouter();
  const query = useSearchParams();
  const queryParams = convertSearchParamsToDictionary(query);
  const pathname = usePathname();
  const theme = useTheme();

  const noAuthRoutes = [
    "/no-auth",
    "/login",
    "/account/forgot-password",
    "/account/reset-password",
  ];
  const noAuth = Boolean(noAuthRoutes.find((r) => pathname?.includes(r)));

  return (
    <GlobalStateProvider>
      <AppProgressBar height="4px" color={theme.colorPrimary} shallowRouting />
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={{
          push: router.push,
          back: router.back,
          query: queryParams,
          asPath: pathname,
        }}
        toolboxComponentGroups={
          [
            /* NEW_TOOLBOXCOMPONENT_GOES_HERE */
          ]
        }
        noAuth={false}
      >
        <StoredFilesProvider baseUrl={backendUrl} ownerId={""} ownerType={""}>
          {noAuth ? (
            <>{children}</>
          ) : (
            <MainLayout noPadding>{children}</MainLayout>
          )}
        </StoredFilesProvider>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
