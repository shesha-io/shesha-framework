import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { IProcessMonitor } from "./interfaces";
import { createNamedContext } from "@/utils/react";
import { ProcessMonitorInstance } from "./instance";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { useSheshaApplication } from "../sheshaApplication";
import { ProcessMonitorContextBinder } from "./processMonitorContextBinder";

export type ProcessMonitorProviderProps = {
    componentName?: string;
    processType: string;
    processId: string;
};

export const ProcessMonitorContext = createNamedContext<IProcessMonitor | undefined>(undefined, "ProcessMonitorContext");

export const ProcessMonitorProvider: FC<PropsWithChildren<ProcessMonitorProviderProps>> = ({ processType, processId, componentName, children }) => {
    const httpClient = useHttpClient();
    const { backendUrl } = useSheshaApplication();
    const [, forceUpdate] = React.useState({});

    const [processMonitor] = useState<IProcessMonitor>(() => {
        const forceRender = (): void => {
            forceUpdate({});
        };
        const instance = new ProcessMonitorInstance({
            processType: processType,
            processId: processId,
            backendUrl,
            httpClient,
            forceRender: forceRender,
        });
        void instance.startAsync();
        return instance;
    });
    useEffect(() => {
        return () => {
            void processMonitor.stopAsync();
        };
    }, [processMonitor]);

    const content = (
        <ProcessMonitorContext.Provider value={processMonitor}>
            {children}
        </ProcessMonitorContext.Provider>
    );

    return componentName
        ? (
            <ProcessMonitorContextBinder contextName={componentName} instance={processMonitor}>
                {content}
            </ProcessMonitorContextBinder>
        )
        : content;
};