import { useContext, useEffect, useState } from "react";
import { ILogEvent, IProcessMonitor, ProcessMonitorSubscriptionType, ProcessStatus } from "./interfaces";
import { ProcessMonitorContext } from "./providers";

export const useProcessMonitorUndefined = (): IProcessMonitor | undefined => useContext(ProcessMonitorContext);

export const useProcessMonitor = (): IProcessMonitor => {
  const context = useProcessMonitorUndefined();
  if (context === undefined)
    throw new Error('useOnlineLogger must be used within a OnlineLoggerProvider');

  return context;
};

export const useProcessMonitorSubscription = (processMonitor: IProcessMonitor, subscriptionType: ProcessMonitorSubscriptionType): object => {
  const [dummy, forceUpdate] = useState({});

  useEffect(() => {
    return processMonitor.subscribe(subscriptionType, () => forceUpdate({}));
  }, [processMonitor, subscriptionType]);

  return dummy;
};

export const useProcessLogEvents = (): ILogEvent[] => {
  const processMonitor = useProcessMonitor();

  useProcessMonitorSubscription(processMonitor, "events");

  return processMonitor.events;
};


export const useProcessStatus = (): ProcessStatus => {
  const processMonitor = useProcessMonitor();

  useProcessMonitorSubscription(processMonitor, "status");

  return processMonitor.status;
};

