import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useEntityTemplates } from '../utils';
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
  const { actionConfiguration, tooltipProperty, labelProperty, entityTypeShortAlias, filter, buttonType: buttonTypeSetting } = settings ?? {};
  const { refetch } = useGet({ path: '', lazy: true });
  const { getEntityTemplateState } = useEntityTemplates(settings);
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
    const response = await refetch(getEntityTemplateState(evaluatedFilters));
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
      permissions: p.permissions ?? item.permissions ?? [],
      buttonType: p.buttonType ?? item.buttonType ?? buttonTypeSetting,
      size: item.size,
      background: p.background ?? item.background,
      border: p.border ?? item.border,
      shadow: p.shadow ?? item.shadow,
      font: p.font ?? item.font,
      stylingBox: p.stylingBox ?? item.stylingBox,
      style: p.style ?? item.style,
      dimensions: p.dimensions ?? item.dimensions,
      actionConfiguration: actionConfiguration,
    }));

    return result;
  }, [settings, item, data]);
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
