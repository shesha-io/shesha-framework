import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FC } from "react";
import { useTemplates } from "../utils";
import { useAppConfigurator } from "@/providers/appConfigurator";
import { ButtonGroupItemProps } from "@/providers/buttonGroupConfigurator";
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup, useNestedPropertyMetadatAccessor } from "@/providers";
import settingsJson from "./entitySettings.json";
import { useGet } from "@/hooks";
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from "../model";
import { useFormEvaluatedFilter } from "@/providers/dataTable/filters/evaluateFilter";


const settingsMarkup = settingsJson as FormMarkup;

const useEntityActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({item, settings}) => {
    const { actionConfiguration, entityLabelProperty, entityTooltipProperty} = settings;
    const { refetch } = useGet({ path: '', lazy: true });
    const { getTemplateState } = useTemplates(settings);
    const [data, setData] = useState(null);
    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(settings.entityTypeShortAlias);
    const evaluatedFilters = useFormEvaluatedFilter({
    filter: settings.filter,
    metadataAccessor: propertyMetadataAccessor,
  });

   useEffect(()=>{
    console.log('test',getTemplateState(evaluatedFilters));
    refetch(getTemplateState(evaluatedFilters)).then((response) => {
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
            label: p[`${entityLabelProperty}`],
            tooltip: p[`${entityTooltipProperty}`],
            itemType: "item",
            itemSubType: "button",
            sortOrder: 0,
            actionConfiguration: actionConfiguration,
        }));

        return result;
    }, [settings, item, data, configurationItemMode]);
    return operations;
};

export const EntityActions: FC<
    PropsWithChildren<IWorkflowInstanceStartActionsProps>
> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id="Entity"
            name="Entity"
            useEvaluator={useEntityActions}
            hasArguments={true}
            settingsFormMarkup={settingsMarkup}
        >
            {children}
        </DynamicActionsProvider>
    );
};
