import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FC } from "react";
import { useTemplates } from "../utils";
import { useAppConfigurator } from "@/providers/appConfigurator";
import { ButtonGroupItemProps } from "@/providers/buttonGroupConfigurator";
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup } from "@/providers";
import settingsJson from "./urlSettings.json";
import { useGet } from "@/hooks";
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from "../model";


const settingsMarkup = settingsJson as FormMarkup;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({item, settings}) => {
    const { actionConfiguration, urlLabelProperty, urlTooltipProperty} = settings;
    const { refetch } = useGet({ path: '', lazy: true });
    const { getTemplateState } = useTemplates(settings);
    const [data, setData] = useState(null);
  
   useEffect(()=>{
    refetch(getTemplateState()).then((response) => {
        const result = typeof response.result === 'object' ? response.result.items : response.result
        setData(result);
    });

   },[item, settings])

    const { configurationItemMode } = useAppConfigurator();

    const operations = useMemo<ButtonGroupItemProps[]>(() => {
        if (!data) return [];

        console.log('data', data);
        const result = data?.map((p) => ({
            id: p.id,
            name: p.name,
            label: p[`${urlLabelProperty}`],
            tooltip: p[`${urlTooltipProperty}`],
            itemType: "item",
            itemSubType: "button",
            sortOrder: 0,
            actionConfiguration: actionConfiguration,
        }));

        return result;
    }, [item, data, configurationItemMode]);

    return operations;
};

export const UrlActions: FC<
    PropsWithChildren<IWorkflowInstanceStartActionsProps>
> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id="Url"
            name="Url"
            useEvaluator={useUrlActions}
            hasArguments={true}
            settingsFormMarkup={settingsMarkup}
        >
            {children}
        </DynamicActionsProvider>
    );
};
