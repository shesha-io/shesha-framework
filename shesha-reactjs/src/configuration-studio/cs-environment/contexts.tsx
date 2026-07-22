import React, { FC, PropsWithChildren, useContext } from "react";
import { IConfigurationStudioEnvironment } from "./interfaces";
import { ConfigurationStudioEnvironment } from "./configurationStudioEnvironment";
import { isDefined } from "@/utils/nullables";
import { createNamedContext } from "@/utils/react";

export const useConfigurationStudioEnvironmentSingletone = (): [IConfigurationStudioEnvironment] => {
  const [configurationStudioEnvironment] = React.useState<IConfigurationStudioEnvironment>(() => {
    // Create a new FormStore if not provided
    const instance = new ConfigurationStudioEnvironment();

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


