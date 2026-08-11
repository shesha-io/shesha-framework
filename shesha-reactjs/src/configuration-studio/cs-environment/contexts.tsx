import { useState, FC, PropsWithChildren, useContext } from "react";
import { IConfigurationStudioEnvironment } from "./interfaces";
import { ConfigurationStudioEnvironment } from "./configurationStudioEnvironment";
import { isDefined } from "@/utils/nullables";
import { createNamedContext } from "@/utils/react";
import { useHttpClient } from "@/providers";

export const useConfigurationStudioEnvironmentSingletone = (): [IConfigurationStudioEnvironment] => {
  const httpClient = useHttpClient();
  const [configurationStudioEnvironment] = useState<IConfigurationStudioEnvironment>(() => {
    // Create a new FormStore if not provided
    const instance = new ConfigurationStudioEnvironment({ httpClient });

    // instance.init();
    return instance;
  });

  return [configurationStudioEnvironment];
};

export const ConfigurationStudioEnvironmentContext = createNamedContext<IConfigurationStudioEnvironment | undefined>(undefined, "ConfigurationStudioEnvironmentContext");

export const ConfigurationStudioEnvironmentProvider: FC<PropsWithChildren> = ({ children }) => {
  const [csEnvironment] = useConfigurationStudioEnvironmentSingletone();

  return (
    <ConfigurationStudioEnvironmentContext.Provider value={csEnvironment}>
      {children}
    </ConfigurationStudioEnvironmentContext.Provider>
  );
};

export const useConfigurationStudioEnvironmentIfAvailable = (): IConfigurationStudioEnvironment | undefined => {
  return useContext(ConfigurationStudioEnvironmentContext);
};

export const useConfigurationStudioEnvironment = (): IConfigurationStudioEnvironment => {
  const context = useConfigurationStudioEnvironmentIfAvailable();

  if (!isDefined(context))
    throw new Error('useConfigurationStudioEnvironment must be used within a ConfigurationStudioEnvironmentProvider');

  return context;
};


