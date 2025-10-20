import { createNamedContext } from "@/utils/react";
import { ConfigurationStudio, IConfigurationStudio } from "./configurationStudio";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { useHttpClient, useShaRouting } from "@/providers";
import { asyncStorage } from "../storage";
import { useModalApi } from "./modalApi";
import { useNotificationApi } from "./notificationApi";
import { isDefined } from "../../utils/nullables";
import { useSearchParams } from "next/navigation";

const useConfigurationStudioSingletone = (): IConfigurationStudio[] => {
  const csRef = React.useRef<IConfigurationStudio>();
  const [, forceUpdate] = React.useState({});
  const httpClient = useHttpClient();
  const modalApi = useModalApi();
  const notificationApi = useNotificationApi();
  const shaRouter = useShaRouting();

  const toolbarRef = useRef<HTMLDivElement>(null!);
  if (!csRef.current) {
    // Create a new FormStore if not provided
    const forceReRender = (): void => {
      forceUpdate({});
    };

    const instance = new ConfigurationStudio({
      forceRootUpdate: forceReRender,
      httpClient,
      storage: asyncStorage,
      modalApi: modalApi,
      notificationApi: notificationApi,
      toolbarRef: toolbarRef,
      shaRouter: shaRouter,
      logEnabled: false,
    });
    csRef.current = instance;

    instance.init();
  }

  const query = useSearchParams();
  const docId = query.get('docId');
  useEffect(() => {
    if (csRef.current && docId)
      csRef.current.openDocumentByIdAsync(docId);
  }, [docId]);

  return [csRef.current];
};

export const ConfigurationStudioContext = createNamedContext<IConfigurationStudio | undefined>(undefined, "ConfigurationStudioContext");

export const ConfigurationStudioProvider: FC<PropsWithChildren> = ({ children }) => {
  const [cs] = useConfigurationStudioSingletone();

  return (
    <ConfigurationStudioContext.Provider value={cs}>
      {children}
    </ConfigurationStudioContext.Provider>
  );
};

export const useConfigurationStudioIfAvailable = (): IConfigurationStudio | undefined => {
  return useContext(ConfigurationStudioContext);
};

export const useConfigurationStudio = (): IConfigurationStudio => {
  const context = useConfigurationStudioIfAvailable();

  if (!isDefined(context))
    throw new Error('useConfigurationStudio must be used within a ConfigurationStudioProvider');

  return context;
};
