import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { FC } from 'react';
import { useTemplates } from '../utils';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator';
import {
  DynamicActionsProvider,
  DynamicItemsEvaluationHook,
  FormMarkup,
  useDataContextManager,
  useNestedPropertyMetadatAccessor,
} from '@/providers';
import settingsJson from './entitySettings.json';
import { useGet } from '@/hooks';
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from '../model';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';

const settingsMarkup = settingsJson as FormMarkup;

const useEntityActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, tooltipProperty, labelProperty, entityTypeShortAlias, filter } = settings;
  const { refetch } = useGet({ path: '', lazy: true });
  const { getTemplateState } = useTemplates(settings);
  const [data, setData] = useState(null);
  const pageContext = useDataContextManager(false)?.getPageContext();
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityTypeShortAlias);
  const evaluatedFilters = useFormEvaluatedFilter({
    filter,
    metadataAccessor: propertyMetadataAccessor,
  });

  const fetchTemplateData = async () => {
    const response = await refetch(getTemplateState(evaluatedFilters ?? null));
    const result = typeof response.result === 'object' ? response.result.items : response.result;
    setData(result);
  };

  useEffect(() => {
    fetchTemplateData();
  }, [item, settings, evaluatedFilters, pageContext]);

  const { configurationItemMode } = useAppConfigurator();

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    const result = data?.map((p) => ({
      id: p.id,
      name: p.name,
      label: p[`${labelProperty}`],
      tooltip: p[`${tooltipProperty}`],
      itemType: 'item',
      itemSubType: 'button',
      sortOrder: 0,
      dynamicItem: p,
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
