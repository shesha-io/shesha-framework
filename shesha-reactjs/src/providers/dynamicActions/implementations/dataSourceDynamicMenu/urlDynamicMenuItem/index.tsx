import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTemplates } from '../utils';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator';
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup, useDataContextManagerActions, useFormData, useGlobalState } from '@/providers';
import { useGet } from '@/hooks';
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from '../model';
import { getSettings } from './urlSettings';

const settingsMarkup = getSettings() as FormMarkup;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, labelProperty, tooltipProperty, buttonType } = settings ?? {};
  const { refetch } = useGet({ path: '', lazy: true });
  const { getTemplateState } = useTemplates(settings);
  const [data, setData] = useState(null);
  const pageContext = useDataContextManagerActions(false)?.getPageContext();
  const { data: FormData } = useFormData();
  const { globalState } = useGlobalState();

  useEffect(() => {
    refetch(getTemplateState()).then((response) => {
      const result = Array.isArray(response.result) ? response.result : response.result.items;
      setData(result);
    });
  }, [item, settings, pageContext, FormData, globalState]);


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
  }, [item, data, configurationItemMode]);

  return operations;
};

export const UrlActions: FC<PropsWithChildren<IWorkflowInstanceStartActionsProps>> = ({ children }) => {
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
