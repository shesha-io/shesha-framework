import { createNamedContext } from "@/utils/react";
import { ConfigurationStudio } from "./configurationStudio";
import { IConfigurationStudio } from "./interfaces";
import React, { FC, PropsWithChildren, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { useHttpClient, useShaRouting } from "@/providers";
import { asyncStorage } from "../storage";
import { useModalApi } from "./modalApi";
import { useNotificationApi } from "./notificationApi";
import { isDefined } from "../../utils/nullables";
import { useSearchParams } from "next/navigation";
import { useConfigurationStudioEnvironment } from "../cs-environment/contexts";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const useConfigurationStudioSingletone = (): [IConfigurationStudio] => {
  const [, forceUpdate] = React.useState({});
  const csEnvironment = useConfigurationStudioEnvironment();
  const httpClient = useHttpClient();
  const modalApi = useModalApi();
  const notificationApi = useNotificationApi();
  const shaRouter = useShaRouting();

  const toolbarRef = useRef<HTMLDivElement>(null!);

  const [configurationStudio] = React.useState<IConfigurationStudio>(() => {
    // Create a new FormStore if not provided
    const instance = new ConfigurationStudio({
      forceRootUpdate: () => forceUpdate({}),
      csEnvironment,
      httpClient,
      storage: asyncStorage,
      modalApi: modalApi,
      notificationApi: notificationApi,
      toolbarRef: toolbarRef,
      shaRouter: shaRouter,
      logEnabled: false,
    });

    instance.init();
    return instance;
  });

  const query = useSearchParams();
  const docId = query.get('docId');
  useEffect(() => {
    if (docId)
      configurationStudio.openDocumentByIdAsync(docId);
  }, [configurationStudio, docId]);

  useEffect(() => {
    return shaRouter.registerNavigationValidator((url) => {
      return Promise.resolve(configurationStudio.confirmNavigation(url));
    });
  }, [configurationStudio, shaRouter]);

  return [configurationStudio];
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
