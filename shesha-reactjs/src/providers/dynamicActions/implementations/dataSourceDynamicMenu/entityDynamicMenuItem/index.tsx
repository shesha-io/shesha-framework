import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTemplates } from '../utils';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator';
import {
  DynamicActionsProvider,
  DynamicItemsEvaluationHook,
  FormMarkup,
  useDataContextManagerActions,
  useFormData,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
} from '@/providers';
import { useGet } from '@/hooks';
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from '../model';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { getSettings } from './entitySettings';

const settingsMarkup = getSettings() as FormMarkup;

const useEntityActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, tooltipProperty, labelProperty, entityTypeShortAlias, filter, buttonType } = settings ?? {};
  const { refetch } = useGet({ path: '', lazy: true });
  const { getTemplateState } = useTemplates(settings);
  const { data: FormData } = useFormData();
  const { globalState } = useGlobalState();
  const [data, setData] = useState(null);
  const pageContext = useDataContextManagerActions(false)?.getPageContext();
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityTypeShortAlias);
  const evaluatedFilters = useFormEvaluatedFilter({
    filter,
    metadataAccessor: propertyMetadataAccessor,
  });

  const fetchTemplateData = async () => {
    const response = await refetch(getTemplateState(evaluatedFilters ?? null));
    const result = Array.isArray(response.result) ? response.result : response.result.items;
    setData(result);
  };

  useEffect(() => {
    const shouldFetch =
      filter === undefined || // No filter case
      (filter !== undefined && evaluatedFilters !== undefined); // Has filter and filters are evaluated

    if (shouldFetch) {
      fetchTemplateData();
    }
  }, [item, settings, evaluatedFilters, pageContext, FormData, globalState]);

  const { configurationItemMode } = useAppConfigurator();

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    const result = data?.map((p) => ({
      id: p.id,
      name: p.name,
      label: p[`${labelProperty}`] || 'Not Configured Properly',
      tooltip: p[`${tooltipProperty}`],
      itemType: 'item',
      itemSubType: 'button',
      sortOrder: 0,
      dynamicItem: p,
      buttonType: buttonType,
      actionConfiguration: actionConfiguration,
    }));

    return result;
  }, [settings, item, data, configurationItemMode]);
  return operations;
};

export const EntityActions: FC<PropsWithChildren<IWorkflowInstanceStartActionsProps>> = ({ children }) => {
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
